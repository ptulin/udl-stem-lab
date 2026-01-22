export type ComponentType = 'battery' | 'bulb' | 'switch' | 'wire'

export interface Component {
  id: string
  type: ComponentType
  x: number
  y: number
  connections: string[] // IDs of connected components
  state?: 'on' | 'off' | 'open' | 'closed'
}

export interface CircuitState {
  components: Component[]
  topology: 'series' | 'parallel' | 'simple' | 'none'
  closed: boolean
  current?: number
  voltage?: number
}

export class CircuitSimulator {
  private components: Component[] = []

  addComponent(type: ComponentType, x: number, y: number): Component {
    const id = `${type}-${Date.now()}-${Math.random()}`
    const component: Component = {
      id,
      type,
      x,
      y,
      connections: [],
      state: type === 'switch' ? 'open' : type === 'bulb' ? 'off' : undefined,
    }
    this.components.push(component)
    return component
  }

  removeComponent(id: string) {
    const component = this.getComponent(id)
    if (component) {
      // Remove connections
      component.connections.forEach(connId => {
        const conn = this.getComponent(connId)
        if (conn) {
          conn.connections = conn.connections.filter(c => c !== id)
        }
      })
      this.components = this.components.filter(c => c.id !== id)
    }
  }

  getComponent(id: string): Component | undefined {
    return this.components.find(c => c.id === id)
  }

  getAllComponents(): Component[] {
    return [...this.components]
  }

  connect(fromId: string, toId: string) {
    const from = this.getComponent(fromId)
    const to = this.getComponent(toId)
    
    if (from && to) {
      if (!from.connections.includes(toId)) {
        from.connections.push(toId)
      }
      if (!to.connections.includes(fromId)) {
        to.connections.push(fromId)
      }
    }
  }

  disconnect(fromId: string, toId: string) {
    const from = this.getComponent(fromId)
    const to = this.getComponent(toId)
    
    if (from && to) {
      from.connections = from.connections.filter(c => c !== toId)
      to.connections = to.connections.filter(c => c !== fromId)
    }
  }

  updateComponentPosition(id: string, x: number, y: number) {
    const component = this.getComponent(id)
    if (component) {
      component.x = x
      component.y = y
    }
  }

  analyzeCircuit(): CircuitState {
    const battery = this.components.find(c => c.type === 'battery')
    const bulbs = this.components.filter(c => c.type === 'bulb')
    const switches = this.components.filter(c => c.type === 'switch')
    
    if (!battery || bulbs.length === 0) {
      return {
        components: this.components,
        topology: 'none',
        closed: false,
      }
    }

    // Check if circuit is closed
    const isClosed = this.isCircuitClosed(battery.id)
    
    // Determine topology
    const topology = this.determineTopology(battery.id, bulbs)
    
    // Calculate current and voltage (simplified)
    const current = isClosed ? this.calculateCurrent(topology, bulbs.length) : 0
    const voltage = battery ? 9 : 0 // Assume 9V battery
    
    // Update component states
    if (isClosed) {
      bulbs.forEach(bulb => {
        bulb.state = topology === 'parallel' ? 'on' : 'on' // Both can be on, brightness differs
      })
    } else {
      bulbs.forEach(bulb => {
        bulb.state = 'off'
      })
    }

    return {
      components: this.components,
      topology,
      closed: isClosed,
      current,
      voltage,
    }
  }

  private isCircuitClosed(startId: string): boolean {
    // Check if there's a path from battery back to battery
    const visited = new Set<string>()
    const stack: string[] = [startId]
    
    while (stack.length > 0) {
      const currentId = stack.pop()!
      if (visited.has(currentId)) {
        // Found a cycle - circuit is closed
        if (currentId === startId) {
          return true
        }
        continue
      }
      
      visited.add(currentId)
      const component = this.getComponent(currentId)
      if (component) {
        component.connections.forEach(connId => {
          if (!visited.has(connId)) {
            stack.push(connId)
          }
        })
      }
    }
    
    return false
  }

  private determineTopology(batteryId: string, bulbs: Component[]): 'series' | 'parallel' | 'simple' {
    if (bulbs.length === 0) return 'simple'
    if (bulbs.length === 1) return 'simple'
    
    // Check if bulbs are in series or parallel
    // Simple heuristic: if bulbs share connections, they might be in parallel
    // If bulbs are connected sequentially, they're in series
    
    const paths: string[][] = []
    const findPaths = (currentId: string, targetId: string, path: string[], visited: Set<string>) => {
      if (currentId === targetId) {
        paths.push([...path, currentId])
        return
      }
      
      visited.add(currentId)
      const component = this.getComponent(currentId)
      if (component) {
        component.connections.forEach(connId => {
          if (!visited.has(connId)) {
            findPaths(connId, targetId, [...path, currentId], new Set(visited))
          }
        })
      }
    }
    
    // Check paths between first two bulbs
    if (bulbs.length >= 2) {
      const bulb1 = bulbs[0]
      const bulb2 = bulbs[1]
      findPaths(bulb1.id, bulb2.id, [], new Set())
      
      // If there are multiple independent paths, it's parallel
      // If there's one path that goes through both bulbs sequentially, it's series
      const pathsThroughBoth = paths.filter(path => {
        const bulb1Index = path.indexOf(bulb1.id)
        const bulb2Index = path.indexOf(bulb2.id)
        return bulb1Index !== -1 && bulb2Index !== -1 && Math.abs(bulb1Index - bulb2Index) === 1
      })
      
      if (pathsThroughBoth.length > 0) {
        return 'series'
      }
      
      // Check if bulbs connect to battery independently
      const bulb1PathsToBattery = this.findPathsToComponent(bulb1.id, batteryId)
      const bulb2PathsToBattery = this.findPathsToComponent(bulb2.id, batteryId)
      
      if (bulb1PathsToBattery.length > 0 && bulb2PathsToBattery.length > 0) {
        // Check if paths are independent (don't share intermediate components)
        const independent = bulb1PathsToBattery.some(path1 => 
          bulb2PathsToBattery.some(path2 => {
            const shared = path1.filter(p => path2.includes(p) && p !== batteryId)
            return shared.length === 0
          })
        )
        
        if (independent) {
          return 'parallel'
        }
      }
    }
    
    // Default to series if we can't determine
    return 'series'
  }

  private findPathsToComponent(fromId: string, toId: string): string[][] {
    const paths: string[][] = []
    const findPathsRecursive = (currentId: string, path: string[], visited: Set<string>) => {
      if (currentId === toId) {
        paths.push([...path, currentId])
        return
      }
      
      visited.add(currentId)
      const component = this.getComponent(currentId)
      if (component) {
        component.connections.forEach(connId => {
          if (!visited.has(connId)) {
            findPathsRecursive(connId, [...path, currentId], new Set(visited))
          }
        })
      }
    }
    
    findPathsRecursive(fromId, [], new Set())
    return paths
  }

  private calculateCurrent(topology: 'series' | 'parallel' | 'simple', bulbCount: number): number {
    // Simplified current calculation
    // In reality, this would depend on resistance, but for MVP we'll use simple values
    const baseCurrent = 0.5 // Amperes
    
    if (topology === 'simple') {
      return baseCurrent
    } else if (topology === 'series') {
      return baseCurrent // Same current through all components
    } else {
      // Parallel: current splits, but total increases
      return baseCurrent * bulbCount * 0.8 // Simplified
    }
  }

  reset() {
    this.components = []
  }
}
