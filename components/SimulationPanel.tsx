'use client'

import { useState, useRef, useEffect } from 'react'
import { CircuitSimulator, type Component, type ComponentType } from '@/lib/circuitSim'
import { useAppStore } from '@/lib/store'

interface SimulationPanelProps {
  simulator: CircuitSimulator
  onCircuitChange: (state: ReturnType<CircuitSimulator['analyzeCircuit']>) => void
  textMode?: boolean
}

export default function SimulationPanel({ simulator, onCircuitChange, textMode = false }: SimulationPanelProps) {
  const [dragging, setDragging] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const canvasRef = useRef<HTMLDivElement>(null)
  const preferences = useAppStore((state) => state.preferences)
  
  const components = simulator.getAllComponents()
  const circuitState = simulator.analyzeCircuit()

  useEffect(() => {
    onCircuitChange(circuitState)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [components.length, circuitState.topology, circuitState.closed])

  const handleMouseDown = (e: React.MouseEvent, componentId: string) => {
    const component = simulator.getComponent(componentId)
    if (!component) return
    
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    
    setDragging(componentId)
    setDragOffset({
      x: e.clientX - rect.left - component.x,
      y: e.clientY - rect.top - component.y,
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging || !canvasRef.current) return
    
    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - dragOffset.x
    const y = e.clientY - rect.top - dragOffset.y
    
    simulator.updateComponentPosition(dragging, x, y)
    const newState = simulator.analyzeCircuit()
    onCircuitChange(newState)
  }

  const handleMouseUp = () => {
    setDragging(null)
  }

  const addComponent = (type: ComponentType) => {
    const x = 100 + Math.random() * 200
    const y = 100 + Math.random() * 200
    simulator.addComponent(type, x, y)
    const newState = simulator.analyzeCircuit()
    onCircuitChange(newState)
  }

  const removeComponent = (id: string) => {
    simulator.removeComponent(id)
    const newState = simulator.analyzeCircuit()
    onCircuitChange(newState)
  }

  if (textMode) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg border-2 border-gray-300">
        <h3 className="text-lg font-semibold mb-4">Circuit State (Text Mode)</h3>
        <div className="space-y-3">
          <div>
            <strong>Topology:</strong> {circuitState.topology === 'none' ? 'No circuit' : circuitState.topology}
          </div>
          <div>
            <strong>Status:</strong> {circuitState.closed ? 'Closed (Current flows)' : 'Open (No current)'}
          </div>
          <div>
            <strong>Components:</strong> {components.length}
          </div>
          {circuitState.current !== undefined && (
            <div>
              <strong>Current:</strong> {circuitState.current.toFixed(2)} A
            </div>
          )}
        </div>
        
        <div className="mt-6 space-y-4">
          <h4 className="font-semibold">Add Component:</h4>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => addComponent('battery')}
              className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-300"
              aria-label="Add battery"
            >
              Add Battery
            </button>
            <button
              onClick={() => addComponent('bulb')}
              className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-300"
              aria-label="Add bulb"
            >
              Add Bulb
            </button>
            <button
              onClick={() => addComponent('switch')}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
              aria-label="Add switch"
            >
              Add Switch
            </button>
            <button
              onClick={() => addComponent('wire')}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
              aria-label="Add wire"
            >
              Add Wire
            </button>
          </div>
        </div>

        {components.length > 0 && (
          <div className="mt-6">
            <h4 className="font-semibold mb-2">Components:</h4>
            <div className="space-y-2">
              {components.map((comp) => (
                <div key={comp.id} className="flex items-center justify-between p-2 bg-white rounded border">
                  <span>{comp.type} ({comp.id.slice(0, 8)})</span>
                  <button
                    onClick={() => removeComponent(comp.id)}
                    className="px-2 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300"
                    aria-label={`Remove ${comp.type}`}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-300 relative">
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => addComponent('battery')}
          className="px-3 py-2 bg-primary-600 text-white rounded text-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-300"
          aria-label="Add battery"
        >
          + Battery
        </button>
        <button
          onClick={() => addComponent('bulb')}
          className="px-3 py-2 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-300"
          aria-label="Add bulb"
        >
          + Bulb
        </button>
        <button
          onClick={() => addComponent('switch')}
          className="px-3 py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
          aria-label="Add switch"
        >
          + Switch
        </button>
      </div>

      <div
        ref={canvasRef}
        className="w-full h-96 bg-white border-2 border-dashed border-gray-400 relative overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        role="application"
        aria-label="Circuit simulation canvas"
      >
        {components.map((comp) => {
          const isDragging = dragging === comp.id
          return (
            <div
              key={comp.id}
              className={`absolute cursor-move ${isDragging ? 'z-10 opacity-80' : 'z-0'}`}
              style={{
                left: `${comp.x}px`,
                top: `${comp.y}px`,
                transform: 'translate(-50%, -50%)',
              }}
              onMouseDown={(e) => handleMouseDown(e, comp.id)}
              role="button"
              tabIndex={0}
              aria-label={`${comp.type} component`}
              onKeyDown={(e) => {
                if (e.key === 'Delete' || e.key === 'Backspace') {
                  removeComponent(comp.id)
                }
              }}
            >
              {comp.type === 'battery' && (
                <div className="w-12 h-16 bg-primary-500 border-2 border-primary-700 rounded flex flex-col items-center justify-center text-white font-bold">
                  <div>+</div>
                  <div className="w-8 h-1 bg-white"></div>
                  <div>-</div>
                </div>
              )}
              {comp.type === 'bulb' && (
                <div className={`w-10 h-10 rounded-full border-2 ${comp.state === 'on' ? 'bg-yellow-300 border-yellow-600' : 'bg-gray-300 border-gray-600'}`}>
                  <div className="w-full h-full flex items-center justify-center">
                    {comp.state === 'on' && <span className="text-yellow-800">??</span>}
                  </div>
                </div>
              )}
              {comp.type === 'switch' && (
                <div className={`w-12 h-6 border-2 ${comp.state === 'closed' ? 'bg-green-500 border-green-700' : 'bg-gray-400 border-gray-600'} rounded`}>
                  <div className="text-xs text-center text-white font-bold pt-1">
                    {comp.state === 'closed' ? 'ON' : 'OFF'}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
        <div className="text-sm space-y-1">
          <div><strong>Topology:</strong> {circuitState.topology === 'none' ? 'No circuit' : circuitState.topology}</div>
          <div><strong>Status:</strong> {circuitState.closed ? '? Closed' : '? Open'}</div>
          {circuitState.current !== undefined && (
            <div><strong>Current:</strong> {circuitState.current.toFixed(2)} A</div>
          )}
        </div>
      </div>
    </div>
  )
}
