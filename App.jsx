
import { useEffect, useRef, useState } from 'react'
import {
  Bluetooth, BluetoothConnected, RefreshCw, Sun, Droplet,
  AlertTriangle, CheckCircle2, Activity, Sliders, Leaf,
  Sprout, Info, Power, WifiOff, Clock, Lightbulb,
  Monitor, Waves, Tv, Search, Zap, X
} from 'lucide-react'
import './App.css'

const MODES = {
  GERMINATION: {
    name: 'Germination',
    subtitle: 'Seeds & Seedlings',
    low: 40,
    high: 70,
    description: 'High, consistent moisture for seeds and young seedlings.',
    icon: Sprout,
    theme: 'germination',
  },
  UNDER_LIGHT: {
    name: 'Under Light',
    subtitle: 'Sprouting & Vegetation',
    low: 35,
    high: 65,
    description: 'Balanced moisture for active growth under light.',
    icon: Leaf,
    theme: 'under-light',
  },
  PRE_HARVEST: {
    name: 'Pre-Harvest',
    subtitle: 'Final Growing Stage',
    low: 30,
    high: 55,
    description: 'A lower moisture target for the final growing stage.',
    icon: Sun,
    theme: 'pre-harvest',
  },
}

const SERVICE_UUID = '0000ffe0-0000-1000-8000-00805f9b34fb'
const CHARACTERISTIC_UUID = '0000ffe1-0000-1000-8000-00805f9b34fb'

function getCondition(value, mode) {
  if (value === null) return 'waiting'
  const limits = MODES[mode]
  if (value < limits.low) return 'dry'
  if (value > limits.high) return 'wet'
  return 'ideal'
}

function getColor(value, mode) {
  if (value === null) return '#64748b'
  const limits = MODES[mode]
  if (value < limits.low) return '#ef4444'
  if (value > limits.high) return '#3b82f6'
  return '#10b981'
}

function getRgbState(value, mode) {
  if (value === null) return { label: 'Waiting for data', colorName: 'Offline' }
  const limits = MODES[mode]
  if (value < limits.low) return { label: 'Too Dry', colorName: 'Red' }
  if (value > limits.high) return { label: 'Too Wet', colorName: 'Blue' }
  return { label: 'Ideal Moisture', colorName: 'Green' }
}

function getRGBSteps() {
  return [
    { label: 'Red', range: '0–14%', color: '#ef4444', min: 0, max: 14 },
    { label: 'Orange', range: '15–29%', color: '#f97316', min: 15, max: 29 },
    { label: 'Yellow', range: '30–44%', color: '#eab308', min: 30, max: 44 },
    { label: 'Lime', range: '45–59%', color: '#84cc16', min: 45, max: 59 },
    { label: 'Green', range: '60–74%', color: '#10b981', min: 60, max: 74 },
    { label: 'Cyan', range: '75–89%', color: '#06b6d4', min: 75, max: 89 },
    { label: 'Blue', range: '90–100%', color: '#3b82f6', min: 90, max: 100 },
  ]
}

// ==================================================
// PLANT VISUALIZATION
// ==================================================

function PlantIllustration({ moisture, mode }) {
  const condition = getCondition(moisture, mode)

  return (
    <div className={`vitality-scene scene-${MODES[mode].theme} scene-${condition}`}>
      <div className="scene-orbit orbit-one" />
      <div className="scene-orbit orbit-two" />
      <div className="scene-glow" />

      {mode === 'UNDER_LIGHT' && (
        <div className="scene-sun">
          <Sun size={27} />
          <span />
        </div>
      )}

      {condition === 'wet' && (
        <div className="rain-dots">
          <Droplet /><Droplet /><Droplet />
        </div>
      )}

      <svg className="vitality-plant" viewBox="0 0 240 220" role="img" aria-label={`${MODES[mode].name} plant`}>
        <defs>
          <linearGradient id="potGradient" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#79513a" />
            <stop offset="100%" stopColor="#35251f" />
          </linearGradient>
          <linearGradient id="soilGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={condition === 'dry' ? '#8b5e35' : condition === 'wet' ? '#17435a' : '#426044'} />
            <stop offset="100%" stopColor="#171d18" />
          </linearGradient>
        </defs>

        <ellipse cx="120" cy="199" rx="76" ry="10" fill="#020604" opacity=".55" />
        <path d="M65 146 L78 195 Q120 207 162 195 L175 146Z" fill="url(#potGradient)" stroke="#a77b58" strokeWidth="1.5" />
        <path d="M65 146 Q120 160 175 146 L171 159 Q120 174 69 159Z" fill="url(#soilGradient)" />
        <ellipse cx="120" cy="148" rx="55" ry="12" fill={condition === 'dry' ? '#76502e' : condition === 'wet' ? '#1c5264' : '#4e704b'} />

        {condition === 'dry' && (
          <g stroke="#d4a16a" strokeWidth="1.5" opacity=".8" fill="none">
            <path d="M91 148 l-7 8 9 5 -4 7" />
            <path d="M137 147 l7 8 -5 6 7 5" />
          </g>
        )}

        {mode === 'GERMINATION' && (
          <>
            <path d="M120 151 Q117 119 120 91" stroke="#75b875" strokeWidth="5" fill="none" strokeLinecap="round" />
            <path className="plant-leaf" d="M120 122 Q83 101 84 122 Q99 143 120 122" fill="#65a96b" />
            <path className="plant-leaf" d="M120 108 Q149 83 160 104 Q147 128 120 108" fill="#4c965c" />
            <path className="plant-leaf" d="M120 93 Q99 71 112 54 Q132 72 120 93" fill="#8acb80" />
          </>
        )}

        {mode === 'UNDER_LIGHT' && (
          <>
            <path d="M120 151 Q116 110 122 55" stroke="#75b875" strokeWidth="5" fill="none" strokeLinecap="round" />
            <path className="plant-leaf leaf-sway-left" d="M120 125 Q82 106 76 78 Q105 76 120 109" fill="#65a96b" />
            <path className="plant-leaf leaf-sway-right" d="M120 103 Q151 69 169 82 Q160 108 120 117" fill="#4c965c" />
            <path className="plant-leaf" d="M122 72 Q98 48 108 25 Q133 44 122 72" fill="#8acb80" />
            <path className="plant-leaf" d="M122 72 Q139 38 161 44 Q157 67 122 72" fill="#5ba66a" />
            <path className="plant-leaf" d="M122 58 Q116 29 128 14 Q143 40 122 58" fill="#9bd58a" />
          </>
        )}

        {mode === 'PRE_HARVEST' && (
          <>
            <path d="M120 151 Q113 104 121 43" stroke="#75b875" strokeWidth="6" fill="none" strokeLinecap="round" />
            <path className="plant-leaf" d="M120 142 Q53 91 49 130 Q78 164 120 142" fill="#4c965c" />
            <path className="plant-leaf" d="M120 129 Q181 77 193 115 Q169 151 120 129" fill="#397e4c" />
            <path className="plant-leaf" d="M120 106 Q75 55 61 84 Q81 119 120 106" fill="#65a96b" />
            <path className="plant-leaf" d="M120 91 Q157 35 179 67 Q160 99 120 91" fill="#4c965c" />
            <path className="plant-leaf" d="M121 67 Q101 29 121 12 Q143 41 121 67" fill="#8acb80" />
          </>
        )}

        {condition === 'dry' && (
          <g fill="#b6a16a" opacity=".7">
            <path d="M119 75 Q104 57 101 47 Q119 49 119 75" />
          </g>
        )}

        {condition === 'wet' && (
          <g fill="#77d8ed" opacity=".9">
            <path d="M48 89 Q39 104 48 110 Q57 104 48 89Z" />
            <path d="M192 103 Q183 118 192 124 Q201 118 192 103Z" />
          </g>
        )}
      </svg>

      <div className="scene-status">
        <span className={`status-dot ${condition}`} />
        {condition === 'waiting' && 'Awaiting sensor data'}
        {condition === 'dry' && 'Moisture below target'}
        {condition === 'ideal' && 'Plant conditions optimal'}
        {condition === 'wet' && 'Moisture above target'}
      </div>
    </div>
  )
}

// ==================================================
// MOISTURE GAUGE
// ==================================================

function MoistureGauge({ value, color }) {
  const radius = 69
  const circumference = 2 * Math.PI * radius
  const progress = value === null ? 0 : Math.max(0, Math.min(100, value))
  const offset = circumference - (progress / 100) * circumference

  return (
    <div className="gauge-wrap">
      <svg viewBox="0 0 170 170" className="gauge">
        <circle cx="85" cy="85" r={radius} className="gauge-track" />
        <circle cx="85" cy="85" r={radius} className="gauge-progress" stroke={color} strokeDasharray={circumference} strokeDashoffset={offset} />
      </svg>
      <div className="gauge-center">
        <span className="gauge-value" style={{ color }}>
          {value === null ? '--' : Math.round(value)}<small>%</small>
        </span>
        <span className="gauge-label">VOLUMETRIC WATER</span>
        <span className="gauge-unit">CONTENT</span>
      </div>
    </div>
  )
}

// ==================================================
// HISTORY GRAPH
// ==================================================

function HistoryGraph({ history }) {
  if (history.length < 2) {
    return (
      <div className="graph-empty">
        <Activity size={23} />
        <p>Waiting for sensor history</p>
        <span>Real readings will appear here after connection.</span>
      </div>
    )
  }

  const points = history.slice(-24)
  const coordinates = points.map((point, index) => {
    const x = 5 + (index / Math.max(points.length - 1, 1)) * 290
    const y = 95 - Math.max(0, Math.min(100, point.value)) * .85
    return `${x},${y}`
  }).join(' ')

  return (
    <div className="history-graph">
      <svg viewBox="0 0 300 105" preserveAspectRatio="none">
        {[20, 40, 60, 80].map(value => (
          <line key={value} x1="0" x2="300" y1={95 - value * .85} y2={95 - value * .85} className="graph-grid" />
        ))}
        <polyline points={coordinates} className="graph-line" />
      </svg>
      <div className="graph-labels">
        <span>Earlier</span>
        <span>Latest</span>
      </div>
    </div>
  )
}

// ==================================================
// MAIN APP
// ==================================================

function App() {
  const [mode, setMode] = useState('UNDER_LIGHT')
  const [tab, setTab] = useState('dashboard')

  const [device, setDevice] = useState(null)
  const [characteristic, setCharacteristic] = useState(null)
  const [connected, setConnected] = useState(false)

  const [moisture, setMoisture] = useState(null)
  const [raw, setRaw] = useState(null)
  const [filtered, setFiltered] = useState(null)

  const [status, setStatus] = useState('Waiting for sensor')
  const [lastUpdate, setLastUpdate] = useState(null)
  const [history, setHistory] = useState([])

  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const [showInfo, setShowInfo] = useState(false)
  const [showSensorDetails, setShowSensorDetails] = useState(false)

  const [stealthMode, setStealthMode] = useState(false)
  const [lcdBacklight, setLcdBacklight] = useState(true)
  const [lcdDisplayMode, setLcdDisplayMode] = useState('VWC_STAGE')
  const [lcdBusy, setLcdBusy] = useState(false)

  const [dryCalibration, setDryCalibration] = useState(520)
  const [wetCalibration, setWetCalibration] = useState(100)

  const buffer = useRef('')
  const lcdModeRequest = useRef(null)
  const writeQueue = useRef(Promise.resolve())

  const currentMode = MODES[mode]
  const color = getColor(moisture, mode)
  const condition = getCondition(moisture, mode)
  const rgbState = getRgbState(moisture, mode)
  const rgbSteps = getRGBSteps()

  const activeRgbIndex = moisture === null
    ? -1
    : rgbSteps.findIndex(step => moisture >= step.min && moisture <= step.max)

  const message = moisture === null
    ? 'Waiting for readings'
    : condition === 'dry'
      ? 'Your plant needs water'
      : condition === 'wet'
        ? 'Moisture is above target'
        : 'Moisture is in the ideal range'

  // ==================================================
  // BLUETOOTH DATA PARSER
  // ==================================================

  function parseLine(line) {
    const parts = line.split(';')
    const type = parts[0]

    const fields = Object.fromEntries(
      parts.slice(1).map(part => {
        const index = part.indexOf('=')
        return index < 0
          ? [part, '']
          : [part.slice(0, index), part.slice(index + 1)]
      })
    )

    if (type === 'DATA') {
      const value = Number(fields.MOISTURE)
      const rawValue = Number(fields.RAW)
      const filteredValue = Number(fields.FILTERED)

      if (Number.isFinite(value)) {
        const safeValue = Math.max(0, Math.min(100, value))
        setMoisture(safeValue)
        setHistory(previous => [...previous, { value: safeValue, time: new Date() }].slice(-100))
      }

      if (Number.isFinite(rawValue)) setRaw(rawValue)
      if (Number.isFinite(filteredValue)) setFiltered(filteredValue)
      if (fields.STATUS) setStatus(fields.STATUS)
      if (fields.MODE && MODES[fields.MODE]) setMode(fields.MODE)
      setLastUpdate(new Date())
    }

    if (type === 'SETTINGS') {
      if (fields.MODE && MODES[fields.MODE]) setMode(fields.MODE)
      if (fields.STEALTH) setStealthMode(fields.STEALTH === 'ON')
      if (fields.BACKLIGHT) setLcdBacklight(fields.BACKLIGHT === 'ON')

      if (fields.LCD_MODE) {
        const receivedMode = fields.LCD_MODE

        if (
          lcdModeRequest.current === null ||
          receivedMode === lcdModeRequest.current
        ) {
          setLcdDisplayMode(receivedMode)

          if (receivedMode === lcdModeRequest.current) {
            lcdModeRequest.current = null
          }
        }
      }
    }

    if (type === 'CALIBRATION') {
      const dry = Number(fields.DRY)
      const wet = Number(fields.WET)
      if (Number.isFinite(dry)) setDryCalibration(dry)
      if (Number.isFinite(wet)) setWetCalibration(wet)
      setNotice('Calibration values received from your Arduino.')
    }

    if (type === 'ERROR') {
      setError(
        line.includes('INVALID_DRY_READING')
          ? 'Arduino: Invalid dry calibration reading.'
          : line.includes('INVALID_MOIST_READING')
            ? 'Arduino: Invalid moist calibration reading.'
            : `Arduino: ${line}`
      )
    }
  }

  function handleData(event) {
    buffer.current += new TextDecoder().decode(event.target.value)
    const lines = buffer.current.split(/\r?\n/)
    buffer.current = lines.pop() || ''
    lines.forEach(line => {
      const cleanLine = line.trim()
      if (cleanLine) parseLine(cleanLine)
    })
  }

  // ==================================================
  // DISCONNECT LISTENER
  // ==================================================

  useEffect(() => {
    if (!device) return

    const disconnect = () => {
      setConnected(false)
      setCharacteristic(null)
      setStatus('Disconnected')
      setNotice('Bluetooth connection ended.')
      lcdModeRequest.current = null
      setLcdBusy(false)
    }

    device.addEventListener('gattserverdisconnected', disconnect)
    return () => device.removeEventListener('gattserverdisconnected', disconnect)
  }, [device])

  // ==================================================
  // BLUETOOTH WRITE HELPER
  // ==================================================

  async function writeBluetoothPacket(characteristicRef, packet) {
    if (characteristicRef.properties.writeWithoutResponse) {
      await characteristicRef.writeValueWithoutResponse(packet)
      return
    }

    if (characteristicRef.properties.write) {
      await characteristicRef.writeValueWithResponse(packet)
      return
    }

    throw new Error('HM-10 characteristic does not support writing.')
  }

  // ==================================================
  // BLUETOOTH CONNECTION
  // ==================================================

  async function connectBluetooth(preferredDevice = null) {
    setError('')
    setNotice('')

    try {
      if (!navigator.bluetooth) {
        setError('Web Bluetooth is unavailable in this browser. Try Chrome or Edge on your computer.')
        return
      }

      let selectedDevice = preferredDevice

      if (!selectedDevice) {
        selectedDevice = await navigator.bluetooth.requestDevice({
          filters: [{ services: [SERVICE_UUID] }],
          optionalServices: [SERVICE_UUID],
        })
      }

      setDevice(selectedDevice)
      setStatus('Connecting to HM-10...')

      const server = await selectedDevice.gatt.connect()
      const service = await server.getPrimaryService(SERVICE_UUID)
      const characteristicRef = await service.getCharacteristic(CHARACTERISTIC_UUID)

      await characteristicRef.startNotifications()

      characteristicRef.removeEventListener('characteristicvaluechanged', handleData)
      characteristicRef.addEventListener('characteristicvaluechanged', handleData)

      setCharacteristic(characteristicRef)
      setConnected(true)
      setStatus('Connected — waiting for data')
      setNotice(`Connected to ${selectedDevice.name || 'your sensor'}.`)

      console.log('HM-10 characteristic properties:', {
        read: characteristicRef.properties.read,
        write: characteristicRef.properties.write,
        writeWithoutResponse: characteristicRef.properties.writeWithoutResponse,
        notify: characteristicRef.properties.notify,
      })

      await sendInitialGet(characteristicRef)

    } catch (err) {
      console.error('Bluetooth connection error:', err)
      setError(err.message || 'Bluetooth connection failed.')
      setConnected(false)
      setCharacteristic(null)
      setStatus('Disconnected')
    }
  }

  // ==================================================
  // INITIAL SENSOR REQUEST
  // ==================================================

  async function sendInitialGet(characteristicRef) {
    try {
      const bytes = new TextEncoder().encode('GET\n')
      await writeBluetoothPacket(characteristicRef, bytes)
      console.log('Initial GET command sent.')

    } catch (err) {
      console.error('Initial Bluetooth command failed:', err)
      setError('Connected, but could not send GET: ' + err.message)
    }
  }

  // ==================================================
  // DISCONNECT
  // ==================================================

  function disconnectBluetooth() {
    if (device?.gatt?.connected) device.gatt.disconnect()

    setConnected(false)
    setCharacteristic(null)
    setStatus('Disconnected')
    setNotice('Sensor disconnected.')
    lcdModeRequest.current = null
    setLcdBusy(false)
    writeQueue.current = Promise.resolve()
  }

  // ==================================================
  // BLUETOOTH WRITE QUEUE
  // ==================================================

  async function sendCommand(command) {
    const characteristicRef = characteristic
    const deviceRef = device

    if (!characteristicRef || !connected || !deviceRef?.gatt?.connected) {
      setError('Connect to your sensor before sending commands.')
      return false
    }

    const performWrite = async () => {
      if (!deviceRef.gatt.connected) {
        throw new Error('HM-10 disconnected before the command could be sent.')
      }

      const bytes = new TextEncoder().encode(command + '\n')
      const packetSize = 20

      console.log('Sending Bluetooth command:', command)
      console.log('Command byte count:', bytes.length)

      for (let i = 0; i < bytes.length; i += packetSize) {
        if (!deviceRef.gatt.connected) {
          throw new Error('HM-10 disconnected during command transmission.')
        }

        const packet = bytes.slice(i, i + packetSize)

        await writeBluetoothPacket(characteristicRef, packet)

        console.log(
          `Sent packet ${Math.floor(i / packetSize) + 1}:`,
          Array.from(packet)
        )
      }

      console.log('Bluetooth command sent successfully:', command)
    }

    const queuedWrite = writeQueue.current.then(performWrite)
    writeQueue.current = queuedWrite.catch(() => {})

    try {
      await queuedWrite
      setError('')
      setNotice(`Command sent: ${command}`)
      return true

    } catch (err) {
      console.error('Bluetooth write error:', {
        command,
        name: err.name,
        message: err.message,
        characteristicProperties: {
          write: characteristicRef.properties.write,
          writeWithoutResponse: characteristicRef.properties.writeWithoutResponse,
        },
        connected: deviceRef.gatt.connected,
      })

      setError(`Bluetooth command failed (${command}): ${err.message}`)
      return false
    }
  }

  // ==================================================
  // GROWTH MODE
  // ==================================================

  async function changeMode(nextMode) {
    if (!MODES[nextMode]) return
    if (await sendCommand(`MODE;${nextMode}`)) setMode(nextMode)
  }

  // ==================================================
  // HARDWARE CONTROLS
  // ==================================================

  async function toggleStealth() {
    const next = !stealthMode
    if (await sendCommand(next ? 'STEALTH;ON' : 'STEALTH;OFF')) {
      setStealthMode(next)
    }
  }

  async function toggleBacklight() {
    const next = !lcdBacklight
    if (await sendCommand(next ? 'LCD;BACKLIGHT;ON' : 'LCD;BACKLIGHT;OFF')) {
      setLcdBacklight(next)
    }
  }

  // ==================================================
  // LCD MODE SELECTION — UPDATED
  // ==================================================

  async function changeLCDMode(next) {
    const validModes = ['VWC_STAGE', 'MIN_MAX', 'RAW_ADC']

    if (!validModes.includes(next)) {
      console.warn('Invalid LCD display mode:', next)
      return
    }

    if (lcdBusy) {
      console.log('LCD command already in progress.')
      return
    }

    if (!connected || !characteristic || !device?.gatt?.connected) {
      setError('Connect to your sensor before changing the LCD display.')
      return
    }

    const displayNames = {
      VWC_STAGE: 'Moisture & Stage',
      MIN_MAX: 'Target Bounds',
      RAW_ADC: 'Raw ADC Data',
    }

    // VWC is intentionally used as a short alias for the first page.
    // The Arduino must translate VWC into VWC_STAGE.
    const commandMode = next === 'VWC_STAGE' ? 'VWC' : next
    const command = `LCD;DISPLAY;${commandMode}`

    setLcdBusy(true)
    lcdModeRequest.current = next
    setNotice(`Switching LCD to ${displayNames[next]}...`)
    setError('')

    console.log('LCD button clicked:', next)
    console.log('LCD command being sent:', command)

    try {
      const success = await sendCommand(command)

      if (success) {
        setLcdDisplayMode(next)
        setNotice(`LCD display changed to: ${displayNames[next]}`)
        console.log('LCD mode command sent successfully:', next)
      } else {
        lcdModeRequest.current = null
        setNotice('LCD command was not delivered. Check the Bluetooth error.')
      }
    } finally {
      setLcdBusy(false)
    }
  }

  async function setManualColor(r, g, b) {
    await sendCommand(`LED;COLOR;${r},${g},${b}`)
  }

  async function setAutomaticLED() {
    if (await sendCommand('LED;AUTO')) setStealthMode(false)
  }

  // ==================================================
  // REFRESH / RECONNECT
  // ==================================================

  async function refreshDashboard() {
    setError('')

    if (connected && characteristic && device?.gatt?.connected) {
      setNotice('Requesting latest sensor reading...')
      await sendCommand('GET')
      return
    }

    if (device) {
      setNotice('Reconnecting to your HM-10 sensor...')
      await connectBluetooth(device)
      return
    }

    setNotice('Select your HM-10 sensor to reconnect.')
    await connectBluetooth()
  }

  // ==================================================
  // CALIBRATION
  // ==================================================

  async function captureCalibration(type) {
    const label = type === 'DRY' ? 'dry' : 'moist'

    if (!window.confirm(`Place the sensor in your ${label} soil condition. Capture the current raw reading as the ${label} reference?`)) {
      return
    }

    if (await sendCommand(`CAL;${type}`)) {
      setNotice(`Requested ${label} soil calibration. Waiting for Arduino confirmation.`)
    }
  }

  // ==================================================
  // STATUS LABELS
  // ==================================================

  const stageStatus = condition === 'waiting'
    ? 'Waiting for sensor'
    : condition === 'dry'
      ? 'Below target range'
      : condition === 'wet'
        ? 'Above target range'
        : 'Within target range'

  // ==================================================
  // RENDER
  // ==================================================

  return (
    <div className="page-background">
      <div className="phone-frame">
        <header className="app-header">
          <div className="ble-status-line">
            <div className="ble-status">
              <span className={`connection-dot ${connected ? 'connected' : 'disconnected'}`} />
              <span>TERRA SENSE BLE</span>
            </div>
            <span className="header-status">{connected ? 'ACTIVE SYNC' : 'DISCONNECTED'}</span>
          </div>

          <div className="header-main">
            <div className="header-brand">
              <div className={`header-bluetooth ${connected ? 'is-connected' : ''}`}>
                {connected ? <BluetoothConnected size={21} /> : <Bluetooth size={21} />}
              </div>
              <div>
                <h1>Terra Sense</h1>
                <p>{device?.name || 'Capacitive VWC Soil Monitor'}</p>
              </div>
            </div>

            <div className="header-actions">
              <button className="header-action" onClick={() => setShowSensorDetails(true)} title="View sensor details" aria-label="View sensor details">
                <Search size={16} />
              </button>
              <button className="header-action" onClick={refreshDashboard} title="Refresh or reconnect sensor" aria-label="Refresh or reconnect sensor">
                <RefreshCw size={16} />
              </button>
            </div>
          </div>

          <div className="connection-controls">
            {connected ? (
              <button className="connect-button disconnect-button" onClick={disconnectBluetooth}>
                <Power size={15} /> Disconnect sensor
              </button>
            ) : (
              <button className="connect-button" onClick={() => connectBluetooth()}>
                <Bluetooth size={15} /> Connect HM-10 sensor
              </button>
            )}
            <span>{connected ? 'Bluetooth connection active' : 'Connect to view live readings'}</span>
          </div>
        </header>

        <main className="app-content">
          {error && (
            <div className="error-message">
              <AlertTriangle size={16} /> {error}
            </div>
          )}

          {notice && (
            <div className="notice">
              <Info size={16} /> {notice}
            </div>
          )}

          {tab === 'dashboard' && (
            <>
              <section className="stage-selector">
                <div className="section-kicker">
                  <span>Growth Stage Profile</span>
                  <button className="icon-quiet" onClick={() => setShowInfo(true)} aria-label="Growth stage information">
                    <Info size={15} />
                  </button>
                </div>

                <div className="stage-grid">
                  {Object.entries(MODES).map(([key, item]) => {
                    const Icon = item.icon
                    return (
                      <button key={key} className={`stage-card ${mode === key ? 'selected' : ''}`} onClick={() => changeMode(key)}>
                        <Icon size={17} />
                        <strong>{item.name}</strong>
                        <span>{item.low}% – {item.high}%</span>
                      </button>
                    )
                  })}
                </div>
              </section>

              <section className={`vitality-card vitality-${MODES[mode].theme}`}>
                <div className="vitality-heading">
                  <div>
                    <p className="section-kicker">LIVE GROWTH VISUALIZATION</p>
                    <h2>Plant Vitality Indicator</h2>
                  </div>
                  <span className={`condition-pill ${condition}`}>
                    {condition === 'waiting' && <WifiOff size={13} />}
                    {condition === 'dry' && <AlertTriangle size={13} />}
                    {condition === 'ideal' && <CheckCircle2 size={13} />}
                    {condition === 'wet' && <Droplet size={13} />}
                    {condition === 'waiting' ? 'Waiting' : condition === 'dry' ? 'Too Dry' : condition === 'wet' ? 'Too Wet' : 'Optimal'}
                  </span>
                </div>

                <PlantIllustration moisture={moisture} mode={mode} />

                <div className="soil-condition">
                  <span className={`soil-indicator ${condition}`} />
                  <span>
                    {condition === 'waiting' && 'Waiting for live soil data'}
                    {condition === 'dry' && 'Soil moisture is below target'}
                    {condition === 'ideal' && 'Healthy soil moisture range'}
                    {condition === 'wet' && 'Soil moisture is above target'}
                  </span>
                  <strong>{currentMode.low}–{currentMode.high}%</strong>
                </div>
              </section>

              <section className="rgb-card">
                <div className="rgb-card-heading">
                  <div className="rgb-heading-title">
                    <span className="rgb-live-light" style={{ background: color, boxShadow: `0 0 12px ${color}` }} />
                    <h3>RGB LED Sensor Output</h3>
                  </div>
                  <span className="rgb-name" style={{ color }}>{rgbState.colorName}</span>
                </div>

                <div className="spectrum-bar">
                  {rgbSteps.map((step, index) => (
                    <span key={step.label} className={activeRgbIndex === index ? 'active' : ''} style={{ background: step.color }} title={`${step.label}: ${step.range}`} />
                  ))}
                </div>

                <div className="spectrum-labels">
                  <span>Red</span><span>Orange</span><span>Yellow</span><span>Green</span><span>Blue</span>
                </div>

                <div className="rgb-current">
                  <span>Current output</span><strong>{rgbState.label}</strong>
                </div>
                <div className="rgb-current">
                  <span>Active mode target</span><strong>{currentMode.low}% – {currentMode.high}%</strong>
                </div>
              </section>

              <section className="moisture-card">
                <div className="moisture-card-heading">
                  <div>
                    <p className="section-kicker">REAL-TIME SENSOR DATA</p>
                    <h3>Volumetric Water Content</h3>
                  </div>
                  <span className={`live-tag ${connected && moisture !== null ? 'live' : ''}`}>
                    <span /> {connected && moisture !== null ? 'LIVE' : 'OFFLINE'}
                  </span>
                </div>

                <div className="gauge-layout">
                  <MoistureGauge value={moisture} color={color} />
                  <div className="gauge-details">
                    <strong style={{ color }}>{message}</strong>
                    <p>Target bounds</p>
                    <div className="target-bounds">
                      <span>{currentMode.low}%</span><span className="target-dash">—</span><span>{currentMode.high}%</span>
                    </div>
                    <small>{stageStatus}</small>
                  </div>
                </div>

                <div className="moisture-meter">
                  <div className="meter-fill" style={{ width: `${moisture ?? 0}%`, background: color }} />
                </div>

                <div className="meter-labels">
                  <span>Dry</span><span>Ideal</span><span>Wet</span>
                </div>

                <div className="sensor-data-row">
                  <div><span>RAW ADC</span><strong>{raw ?? '—'}</strong></div>
                  <div><span>FILTERED</span><strong>{filtered === null ? '—' : filtered.toFixed(1)}</strong></div>
                  <div><span>LAST UPDATE</span><strong>{lastUpdate ? lastUpdate.toLocaleTimeString() : '—'}</strong></div>
                </div>
              </section>

              <section className="activity-card">
                <div className="card-title-row">
                  <div>
                    <p className="section-kicker">SENSOR ACTIVITY</p>
                    <h3>Moisture history</h3>
                  </div>
                  <Clock size={17} />
                </div>
                <HistoryGraph history={history} />
              </section>
            </>
          )}

          {tab === 'hardware' && (
            <>
              <div className="page-title">
                <p className="section-kicker">DEVICE CONFIGURATION</p>
                <h2>Hardware Controls</h2>
                <span>Manage the physical indicators connected to your Arduino.</span>
              </div>

              <section className="hardware-card">
                <div className="hardware-title">
                  <div className="hardware-title-icon"><Lightbulb size={19} /></div>
                  <div><h3>Physical RGB LED</h3><p>Live indicator control & color testing</p></div>
                </div>

                <div className="hardware-setting">
                  <div><strong>Night / Stealth Mode</strong><span>Turn off the physical LED light</span></div>
                  <button className={`switch ${stealthMode ? 'on' : ''}`} onClick={toggleStealth} disabled={!connected}><i /></button>
                </div>

                <div className="setting-divider" />
                <div className="subsection-label">Manual RGB color test</div>

                <div className="color-test-grid">
                  {[
                    { name: 'Red', rgb: [255, 0, 0], color: '#ef4444' },
                    { name: 'Orange', rgb: [255, 10, 0], color: '#f97316' },
                    { name: 'Yellow', rgb: [255, 30, 0], color: '#eab308' },
                    { name: 'Green', rgb: [0, 255, 0], color: '#10b981' },
                    { name: 'Blue', rgb: [0, 0, 255], color: '#3b82f6' },
                  ].map(item => (
                    <button key={item.name} onClick={() => setManualColor(...item.rgb)} disabled={!connected}>
                      <span style={{ background: item.color }} />{item.name}
                    </button>
                  ))}
                </div>

                <button className="secondary-action" onClick={setAutomaticLED} disabled={!connected}>
                  <RefreshCw size={15} /> Restore automatic color mode
                </button>
              </section>

              <section className="hardware-card">
                <div className="hardware-title">
                  <div className="hardware-title-icon lcd-icon"><Tv size={19} /></div>
                  <div><h3>Physical 16×2 LCD Screen</h3><p>Display layout & backlight controls</p></div>
                </div>

                <div className="hardware-setting">
                  <div><strong>LCD Backlight</strong><span>Turn the physical screen light on or off</span></div>
                  <button className={`switch ${lcdBacklight ? 'on' : ''}`} onClick={toggleBacklight} disabled={!connected}><i /></button>
                </div>

                <div className="setting-divider" />
                <div className="subsection-label">LCD content page layout</div>

                <div className="lcd-mode-grid">
                  {[
                    ['VWC_STAGE', 'Moisture & Stage'],
                    ['MIN_MAX', 'Target Bounds'],
                    ['RAW_ADC', 'Raw ADC Data'],
                  ].map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      className={lcdDisplayMode === key ? 'selected' : ''}
                      onClick={() => changeLCDMode(key)}
                      disabled={!connected || lcdBusy}
                    >
                      {lcdBusy && lcdModeRequest.current === key ? 'Switching...' : label}
                    </button>
                  ))}
                </div>

                <div className={`lcd-preview ${lcdBacklight ? 'backlit' : ''}`}>
                  <div className="lcd-preview-top">
                    <span>HARDWARE LCD PREVIEW</span><span>{lcdBacklight ? 'BACKLIGHT ON' : 'BACKLIGHT OFF'}</span>
                  </div>
                  <div className="lcd-line">TERRA SENSE VWC</div>
                  <div className="lcd-line lcd-main">
                    {lcdDisplayMode === 'VWC_STAGE' && `${moisture === null ? '--' : Math.round(moisture)}% • ${currentMode.name.toUpperCase()}`}
                    {lcdDisplayMode === 'MIN_MAX' && `${currentMode.low}% MIN - ${currentMode.high}% MAX`}
                    {lcdDisplayMode === 'RAW_ADC' && `RAW ADC: ${raw ?? '---'}`}
                  </div>
                </div>
              </section>

              <section className="hardware-card device-list">
                <p className="section-kicker">CONNECTED COMPONENTS</p>
                <h3>Hardware status</h3>

                {[
                  [Droplet, 'Capacitive soil sensor', 'Analog input A0'],
                  [Bluetooth, 'HM-10 BLE module', 'BLE UART connection'],
                  [Lightbulb, 'RGB LED indicator', 'Pins 11, 10, 9'],
                  [Monitor, '16×2 LCD display', 'I2C address 0x27'],
                ].map(([Icon, name, detail]) => (
                  <div className="component-row" key={name}>
                    <div className="component-icon"><Icon size={17} /></div>
                    <div><strong>{name}</strong><span>{detail}</span></div>
                    <span className={name.includes('sensor') || name.includes('HM-10') ? connected ? 'component-online' : 'component-offline' : 'component-local'}>
                      {name.includes('sensor') || name.includes('HM-10') ? connected ? 'ONLINE' : 'OFFLINE' : 'DEVICE'}
                    </span>
                  </div>
                ))}

                <button className="secondary-action" onClick={() => sendCommand('GET')} disabled={!connected}>
                  <RefreshCw size={15} /> Request latest sensor data
                </button>
              </section>
            </>
          )}

          {tab === 'calibrate' && (
            <>
              <div className="page-title">
                <p className="section-kicker">SENSOR ACCURACY</p>
                <h2>Calibration Wizard</h2>
                <span>Set the dry and moist reference points using your actual soil readings.</span>
              </div>

              <section className="calibration-card">
                <div className="calibration-heading">
                  <div className="calibration-icon"><Sliders size={20} /></div>
                  <div><h3>Two-Point Calibration</h3><p>Arduino sensor reference values</p></div>
                </div>

                <div className="calibration-steps">
                  <div className="calibration-step active"><span>01</span><strong>Dry soil</strong></div>
                  <div className="calibration-step active"><span>02</span><strong>Moist soil</strong></div>
                </div>

                <div className="calibration-reading">
                  <span>Current raw ADC reading</span>
                  <strong>{raw ?? '—'}</strong>
                  <small>{connected ? 'Live from Arduino' : 'Connect sensor to receive a reading'}</small>
                </div>

                <div className="calibration-reference">
                  <div><span>Dry reference</span><strong>{dryCalibration}</strong></div>
                  <div><span>Moist reference</span><strong>{wetCalibration}</strong></div>
                </div>

                <div className="calibration-instruction">
                  <Info size={17} />
                  <p>Capture the dry reference with the sensor in dry soil, then capture the moist reference with the sensor in moist soil. Keep the electronics out of water.</p>
                </div>

                <div className="calibration-action">
                  <div className="calibration-action-icon dry"><Zap size={18} /></div>
                  <div><strong>Step 1 — Dry soil reference</strong><span>Place the sensor in your dry soil sample.</span></div>
                </div>

                <button className="calibration-button dry-button" onClick={() => captureCalibration('DRY')} disabled={!connected || raw === null}>
                  <RefreshCw size={16} /> Capture dry soil reading
                </button>

                <div className="calibration-action">
                  <div className="calibration-action-icon wet"><Droplet size={18} /></div>
                  <div><strong>Step 2 — Moist soil reference</strong><span>Place the sensor in your moist soil sample.</span></div>
                </div>

                <button className="calibration-button wet-button" onClick={() => captureCalibration('MOIST')} disabled={!connected || raw === null}>
                  <Waves size={16} /> Capture moist soil reading
                </button>

                <button className="secondary-action reset-calibration" onClick={() => {
                  if (window.confirm('Restore the original calibration values: dry 520 and moist 100?')) {
                    sendCommand('CAL;RESET')
                  }
                }} disabled={!connected}>
                  <RefreshCw size={15} /> Restore original calibration
                </button>
              </section>
            </>
          )}
        </main>

        <footer className="bottom-navigation">
          <button className={tab === 'dashboard' ? 'active' : ''} onClick={() => setTab('dashboard')}>
            <Activity size={20} /><span>Dashboard</span>
          </button>
          <button className={tab === 'hardware' ? 'active' : ''} onClick={() => setTab('hardware')}>
            <Tv size={20} /><span>Hardware</span>
          </button>
          <button className={tab === 'calibrate' ? 'active' : ''} onClick={() => setTab('calibrate')}>
            <Sliders size={20} /><span>Calibrate</span>
          </button>
        </footer>

        {showSensorDetails && (
          <div className="modal-backdrop" onClick={() => setShowSensorDetails(false)}>
            <section className="info-modal" onClick={event => event.stopPropagation()}>
              <div className="modal-heading">
                <div><p className="section-kicker">LIVE SENSOR INFORMATION</p><h3>Sensor Details</h3></div>
                <button className="icon-quiet" onClick={() => setShowSensorDetails(false)} aria-label="Close sensor details"><X size={18} /></button>
              </div>

              <div className="modal-stage"><strong>Moisture Level</strong><span>{moisture === null ? '--' : `${Math.round(moisture)}%`}</span><p>Current volumetric water content.</p></div>
              <div className="modal-stage"><strong>Raw ADC Reading</strong><span>{raw ?? '--'}</span><p>Unfiltered analog sensor measurement.</p></div>
              <div className="modal-stage"><strong>Filtered Reading</strong><span>{filtered === null ? '--' : filtered.toFixed(1)}</span><p>Smoothed analog sensor measurement.</p></div>
              <div className="modal-stage"><strong>Growth Stage</strong><span>{currentMode.name}</span><p>{currentMode.description}</p></div>
              <div className="modal-stage"><strong>Sensor Connection</strong><span>{connected ? 'Connected' : 'Disconnected'}</span><p>{status}</p></div>

              <button className="connect-button modal-close" onClick={() => setShowSensorDetails(false)}>Close</button>
            </section>
          </div>
        )}

        {showInfo && (
          <div className="modal-backdrop" onClick={() => setShowInfo(false)}>
            <section className="info-modal" onClick={event => event.stopPropagation()}>
              <div className="modal-heading">
                <div><p className="section-kicker">GROWTH PROFILES</p><h3>Moisture target ranges</h3></div>
                <button className="icon-quiet" onClick={() => setShowInfo(false)}><X size={18} /></button>
              </div>

              {Object.entries(MODES).map(([key, item]) => (
                <div className="modal-stage" key={key}>
                  <strong>{item.name}</strong><span>{item.low}%–{item.high}%</span><p>{item.description}</p>
                </div>
              ))}

              <button className="connect-button modal-close" onClick={() => setShowInfo(false)}>Close</button>
            </section>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
