import { useState, useEffect } from 'react';
import type {
  Station,
  Peripherals,
  Printers,
  PrinterPlacement,
  Infrastructure,
  ProvisionerState,
  PrinterType,
  LocationType,
  NetworkEquipment,
  Complexity,
} from '@/types/provisioner';
import Head from 'next/head';

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1);
  const [stationCounter, setStationCounter] = useState(0);
  const [notionLoading, setNotionLoading] = useState(false);
  const [notionMessage, setNotionMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const [state, setState] = useState<ProvisionerState>({
    customerName: '',
    stations: [],
    peripherals: { stands: 0, drawers: 0, readers: 0 },
    printers: { receipt: 0, kitchen: 0, label: 0 },
    printersPlacement: [],
    infrastructure: {
      hasInternet: null,
      routerLocation: '',
      hasPort: null,
      simProvider: '',
      simProviderOther: '',
    },
  });

  // Initialize with first station on mount
  useEffect(() => {
    addStation();
  }, []);

  // Calculate warnings for Step 1
  const getStep1Warnings = (): string[] => {
    const warnings: string[] = [];
    state.stations.forEach((station, idx) => {
      if (station.hasCDS && !station.hasPOS) {
        warnings.push(`⚠️ Station ${idx + 1}: CDS iPad requires a POS iPad to pair with. Ensure customer has their own POS iPad.`);
      }
      if (!station.hasPOS && !station.hasCDS) {
        warnings.push(`⚠️ Station ${idx + 1}: No iPads selected. This station will have no equipment.`);
      }
    });
    return warnings;
  };

  const saveState = (newState: ProvisionerState) => {
    setState(newState);
    localStorage.setItem('waffleProvisionerState', JSON.stringify(newState));
  };

  const addStation = () => {
    const newCounter = stationCounter + 1;
    setStationCounter(newCounter);
    const newStation: Station = {
      id: newCounter,
      hasPOS: false,
      hasCDS: false,
    };
    const newState = { ...state, stations: [...state.stations, newStation] };
    saveState(newState);
  };

  const removeStation = (id: number) => {
    const newStations = state.stations.filter((s) => s.id !== id);
    saveState({ ...state, stations: newStations });
  };

  const updateStation = (id: number, field: 'hasPOS' | 'hasCDS', value: boolean) => {
    const newStations = state.stations.map((s) =>
      s.id === id ? { ...s, [field]: value } : s
    );
    saveState({ ...state, stations: newStations });
  };

  const updateCounter = (
    type: 'stands' | 'drawers' | 'readers',
    delta: number
  ) => {
    const newValue = Math.max(0, state.peripherals[type] + delta);
    saveState({
      ...state,
      peripherals: { ...state.peripherals, [type]: newValue },
    });
  };

  const updatePrinterCount = (type: PrinterType, delta: number) => {
    const newValue = Math.max(0, state.printers[type] + delta);
    saveState({
      ...state,
      printers: { ...state.printers, [type]: newValue },
    });
  };

  const selectInfraOption = (
    key: 'hasInternet' | 'hasPort',
    value: boolean
  ) => {
    saveState({
      ...state,
      infrastructure: { ...state.infrastructure, [key]: value },
    });
  };

  const updateInfraField = (field: keyof Infrastructure, value: string) => {
    saveState({
      ...state,
      infrastructure: { ...state.infrastructure, [field]: value },
    });
  };

  const updatePrinterPlacement = (
    index: number,
    updates: Partial<PrinterPlacement>
  ) => {
    const newPlacement = [...state.printersPlacement];
    newPlacement[index] = { ...newPlacement[index], ...updates } as PrinterPlacement;
    saveState({ ...state, printersPlacement: newPlacement });
  };

  const selectPrinterOption = (index: number, key: keyof PrinterPlacement, value: any) => {
    const updates: Partial<PrinterPlacement> = { [key]: value };
    updatePrinterPlacement(index, updates);
  };

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
    window.scrollTo(0, 0);
  };

  const startNewOrder = () => {
    if (confirm('Start a new order? Current order will be cleared.')) {
      localStorage.removeItem('waffleProvisionerState');
      setState({
        customerName: '',
        stations: [],
        peripherals: { stands: 0, drawers: 0, readers: 0 },
        printers: { receipt: 0, kitchen: 0, label: 0 },
        printersPlacement: [],
        infrastructure: {
          hasInternet: null,
          routerLocation: '',
          hasPort: null,
          simProvider: '',
          simProviderOther: '',
        },
      });
      setStationCounter(0);
      setCurrentStep(1);
      setNotionMessage(null);
      // Add first station after reset
      setTimeout(addStation, 0);
    }
  };

  // Helper functions
  const formatLocation = (loc: string): string => {
    if (!loc) return '';
    return loc
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  const getStationName = (stationId: string): string => {
    const station = state.stations.find((s) => s.id.toString() === stationId);
    if (!station) return 'Unknown Station';
    const stationIndex = state.stations.indexOf(station);
    return `Station ${stationIndex + 1}`;
  };

  const getPrinterModel = (
    type: PrinterType,
    placement: PrinterPlacement
  ): string => {
    if (type === 'label') return 'ZD411';
    if (placement.hasOutlet || (placement.canCable && placement.cableLength !== 'wifi')) {
      return 'TM-T82X';
    }
    return 'M30-III';
  };

  const getPrinterConnection = (placement: PrinterPlacement): string => {
    if (placement.hasOutlet) {
      const cable1 = placement.routerToOutletCableLength || 1;
      const cable2 = placement.outletToPrinterCableLength || 1;
      return `LAN ${cable1}M + ${cable2}M (via outlet)`;
    }
    if (placement.canCable) {
      if (placement.cableLength === 'wifi') {
        if (placement.distance === 'over10') {
          return 'WiFi (>10M, may need router upgrade)';
        }
        return 'WiFi';
      }
      return `LAN ${placement.cableLength}M`;
    }
    if (placement.distance === 'over10') {
      return 'WiFi (>10M, may need router upgrade)';
    }
    return 'WiFi';
  };

  const calculateNetworkEquipment = (): NetworkEquipment => {
    let router = '';
    let needsSwitch = false;
    let wiredCount = 0;

    state.printersPlacement.forEach((p) => {
      if (p && (p.hasOutlet || (p.canCable && p.cableLength !== 'wifi'))) {
        wiredCount++;
      }
    });

    const hasLongRangeNeeds = state.printersPlacement.some(
      (p) => p && ((!p.canCable && !p.hasOutlet) || (p.canCable && p.cableLength === 'wifi')) && p.distance === 'over10'
    );

    if (state.infrastructure.hasInternet) {
      router = hasLongRangeNeeds ? '1x ER706W Router' : '1x ER605W Router';
      if (state.infrastructure.hasPort === false || wiredCount > 1) {
        needsSwitch = true;
      }
    } else {
      router = hasLongRangeNeeds ? '1x ER706W4G-V2 Router' : '1x MR505 Router';
      const routerPorts = hasLongRangeNeeds ? 4 : 3;
      if (wiredCount > routerPorts) {
        needsSwitch = true;
      }
    }

    const cableCounts: { [key: number]: number } = { 1: 0, 3: 0, 5: 0, 10: 0 };
    state.printersPlacement.forEach((p) => {
      if (p) {
        if (p.hasOutlet) {
          if (p.routerToOutletCableLength === 1) cableCounts[1]++;
          else if (p.routerToOutletCableLength === 3) cableCounts[3]++;
          else if (p.routerToOutletCableLength === 5) cableCounts[5]++;

          if (p.outletToPrinterCableLength === 1) cableCounts[1]++;
          else if (p.outletToPrinterCableLength === 3) cableCounts[3]++;
          else if (p.outletToPrinterCableLength === 5) cableCounts[5]++;
        } else if (p.canCable && p.cableLength !== 'wifi') {
          if (p.cableLength === 1) cableCounts[1]++;
          else if (p.cableLength === 3) cableCounts[3]++;
          else if (p.cableLength === 5) cableCounts[5]++;
          else if (p.cableLength === 10) cableCounts[10]++;
        }
      }
    });

    let cables = '';
    if (cableCounts[1] > 0) cables += `${cableCounts[1]}x 1M Ethernet Cable, `;
    if (cableCounts[3] > 0) cables += `${cableCounts[3]}x 3M Ethernet Cable, `;
    if (cableCounts[5] > 0) cables += `${cableCounts[5]}x 5M Ethernet Cable, `;
    if (cableCounts[10] > 0) cables += `${cableCounts[10]}x 10M Ethernet Cable`;
    cables = cables.replace(/, $/, '');

    return {
      router,
      switch: needsSwitch ? '1x 5-Port Switch' : null,
      cables: cables || null,
    };
  };

  const calculateComplexity = (): Complexity => {
    let wiredPrinters = 0;
    const totalPrinters =
      state.printers.receipt + state.printers.kitchen + state.printers.label;

    state.printersPlacement.forEach((p) => {
      if (p && (p.hasOutlet || (p.canCable && p.cableLength !== 'wifi'))) {
        wiredPrinters++;
      }
    });

    const hasSwitch = calculateNetworkEquipment().switch !== null;
    const hasLabelWithoutCable = state.printersPlacement.some(
      (p) => p && p.type === 'label' && !p.hasOutlet && (!p.canCable || p.cableLength === 'wifi')
    );

    if (totalPrinters > 5 || hasLabelWithoutCable) {
      return { level: 'HIGH', time: '2 hours' };
    }
    if (wiredPrinters > 2 || hasSwitch) {
      return { level: 'MEDIUM', time: '1.5 hours' };
    }
    return { level: 'LOW', time: '1 hour' };
  };

  const generateOrderText = (): string => {
    let text = '=== WAFFLE HARDWARE ORDER ===\n\n';
    text += `CUSTOMER: ${state.customerName || 'Not specified'}\n\n`;

    text += '## POS STATIONS\n\n';
    state.stations.forEach((station, idx) => {
      text += `Station ${idx + 1}:\n`;
      if (station.hasPOS) text += '  - 1x iPad (POS)\n';
      if (station.hasCDS) text += '  - 1x iPad (CDS)\n';
      text += '\n';
    });

    if (
      state.peripherals.stands > 0 ||
      state.peripherals.drawers > 0 ||
      state.peripherals.readers > 0
    ) {
      text += '## PERIPHERALS\n\n';
      let standsRemaining = state.peripherals.stands;
      let drawersRemaining = state.peripherals.drawers;
      let readersRemaining = state.peripherals.readers;

      state.stations.forEach((station, idx) => {
        const stationPeripherals: string[] = [];
        if (standsRemaining > 0 && (station.hasPOS || station.hasCDS)) {
          stationPeripherals.push('1x POS Stand');
          standsRemaining--;
        }
        if (drawersRemaining > 0) {
          stationPeripherals.push('1x Cash Drawer');
          drawersRemaining--;
        }
        if (readersRemaining > 0 && station.hasPOS) {
          stationPeripherals.push('1x Card Reader');
          readersRemaining--;
        }
        if (stationPeripherals.length > 0) {
          text += `Station ${idx + 1}:\n`;
          stationPeripherals.forEach((item) => (text += `  - ${item}\n`));
          text += '\n';
        }
      });

      if (standsRemaining > 0 || drawersRemaining > 0 || readersRemaining > 0) {
        text += 'Unallocated (spares):\n';
        if (standsRemaining > 0) text += `  - ${standsRemaining}x POS Stand\n`;
        if (drawersRemaining > 0) text += `  - ${drawersRemaining}x Cash Drawer\n`;
        if (readersRemaining > 0) text += `  - ${readersRemaining}x Card Reader\n`;
        text += '\n';
      }
    }

    const printersByLocation: {
      [key: string]: Array<{
        type: PrinterType;
        placement: PrinterPlacement;
        stationName: string;
      }>;
    } = {};

    state.printersPlacement.forEach((placement) => {
      if (placement && placement.location && placement.type) {
        const loc =
          placement.location === 'other'
            ? placement.locationCustom || 'Other'
            : formatLocation(placement.location);
        if (!printersByLocation[loc]) {
          printersByLocation[loc] = [];
        }
        printersByLocation[loc].push({
          type: placement.type,
          placement: placement,
          stationName: getStationName(placement.stationId),
        });
      }
    });

    if (Object.keys(printersByLocation).length > 0) {
      text += '## PRINTERS\n\n';
      Object.keys(printersByLocation).forEach((location) => {
        text += `${location}:\n`;
        printersByLocation[location].forEach((printer) => {
          const model = getPrinterModel(printer.type, printer.placement);
          const connection = getPrinterConnection(printer.placement);
          const typeLabel =
            printer.type.charAt(0).toUpperCase() + printer.type.slice(1);
          text += `  - 1x ${model} ${typeLabel} (${connection}, paired to ${printer.stationName})\n`;
        });
        text += '\n';
      });
    }

    const network = calculateNetworkEquipment();
    text += '## NETWORK EQUIPMENT\n\n';
    text += `  - ${network.router}\n`;
    if (network.switch) text += `  - ${network.switch}\n`;
    if (network.cables) text += `  - ${network.cables}\n`;
    text += '\n';

    const complexity = calculateComplexity();
    text += `## INSTALLATION\n\n`;
    text += `Complexity: ${complexity.level} (${complexity.time})\n`;

    return text;
  };

  const copyToClipboard = async () => {
    const text = generateOrderText();
    try {
      await navigator.clipboard.writeText(text);
      alert('✓ Copied to Clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Failed to copy. Please copy manually from the review.');
    }
  };

  const updateNotionDatabase = async () => {
    if (!state.customerName) {
      alert('Please enter a customer name before submitting to Notion');
      return;
    }

    setNotionLoading(true);
    setNotionMessage(null);

    try {
      const response = await fetch('/api/notion/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName: state.customerName,
          stations: state.stations,
          peripherals: state.peripherals,
          printers: state.printersPlacement,
          networkEquipment: calculateNetworkEquipment(),
          complexity: calculateComplexity(),
          orderText: generateOrderText(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setNotionMessage({
          type: 'success',
          text: `✓ Order created successfully in Notion! ${
            data.pageUrl ? `View: ${data.pageUrl}` : ''
          }`,
        });
      } else {
        setNotionMessage({
          type: 'error',
          text: `Failed to create order: ${data.error || 'Unknown error'}`,
        });
      }
    } catch (error) {
      setNotionMessage({
        type: 'error',
        text: 'Network error: Failed to connect to server',
      });
    } finally {
      setNotionLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Waffle Hardware Provisioner!</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>

      <div className="container">
        <div className="header">
          <h1>Waffle Hardware Provisioner</h1>
          <p>Configure POS stations, printers, and network equipment for your customer</p>
        </div>

        <div className="customer-name-section">
          <label htmlFor="customerName">Customer Name *</label>
          <input
            type="text"
            id="customerName"
            placeholder="Enter customer business name"
            value={state.customerName}
            onChange={(e) =>
              saveState({ ...state, customerName: e.target.value })
            }
          />
        </div>

        <div className="progress-bar">
          <div className="progress-steps">
            {['Stations', 'Printers', 'Placement', 'Infrastructure', 'Review'].map(
              (label, idx) => (
                <div
                  key={idx}
                  className={`progress-step ${
                    idx + 1 === currentStep
                      ? 'active'
                      : idx + 1 < currentStep
                      ? 'completed'
                      : ''
                  }`}
                  onClick={() => goToStep(idx + 1)}
                >
                  {label}
                </div>
              )
            )}
          </div>
        </div>

        {/* Step 1: Stations */}
        {currentStep === 1 && (
          <div className="card">
            <h2>POS Stations</h2>
            <p className="help-text">
              Each station represents a checkout point. Configure iPads only.
            </p>

            {state.stations.map((station, idx) => (
              <div key={station.id} className="station-card">
                <div className="station-header">
                  <div className="station-title">Station {idx + 1}</div>
                  {state.stations.length > 1 && (
                    <button
                      className="remove-station-btn"
                      onClick={() => removeStation(station.id)}
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="checkbox-group">
                  <div className="checkbox-item">
                    <input
                      type="checkbox"
                      id={`hasPOS_${station.id}`}
                      checked={station.hasPOS}
                      onChange={(e) =>
                        updateStation(station.id, 'hasPOS', e.target.checked)
                      }
                    />
                    <label htmlFor={`hasPOS_${station.id}`}>POS iPad</label>
                  </div>
                  <div className="checkbox-item">
                    <input
                      type="checkbox"
                      id={`hasCDS_${station.id}`}
                      checked={station.hasCDS}
                      onChange={(e) =>
                        updateStation(station.id, 'hasCDS', e.target.checked)
                      }
                    />
                    <label htmlFor={`hasCDS_${station.id}`}>CDS iPad</label>
                  </div>
                </div>
              </div>
            ))}

            <button className="add-btn" onClick={addStation}>
              + Add Station
            </button>

            {getStep1Warnings().map((warning, idx) => (
              <div key={idx} className="warning">
                {warning}
              </div>
            ))}

            <h3>Peripherals</h3>
            <p className="help-text">
              Total peripherals needed (AMs will allocate to stations on-site)
            </p>

            <div className="counter-group">
              {[
                { label: 'POS Stands', key: 'stands' as const },
                { label: 'Cash Drawers', key: 'drawers' as const },
                { label: 'Card Readers', key: 'readers' as const },
              ].map((item) => (
                <div key={item.key} className="counter-item">
                  <div className="counter-label">{item.label}</div>
                  <div className="counter-controls">
                    <button
                      className="counter-btn"
                      onClick={() => updateCounter(item.key, -1)}
                    >
                      −
                    </button>
                    <div className="counter-value">
                      {state.peripherals[item.key]}
                    </div>
                    <button
                      className="counter-btn"
                      onClick={() => updateCounter(item.key, 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="nav-buttons">
              <button className="nav-btn primary" onClick={nextStep}>
                Next Step →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Printers */}
        {currentStep === 2 && (
          <div className="card">
            <h2>Printers</h2>
            <p className="help-text">
              How many printers do you need? You'll configure placement details in
              the next step.
            </p>

            <div className="counter-group">
              {[
                { label: 'Receipt Printers', key: 'receipt' as const },
                { label: 'Kitchen Printers', key: 'kitchen' as const },
                { label: 'Label Printers', key: 'label' as const },
              ].map((item) => (
                <div key={item.key} className="counter-item">
                  <div className="counter-label">{item.label}</div>
                  <div className="counter-controls">
                    <button
                      className="counter-btn"
                      onClick={() => updatePrinterCount(item.key, -1)}
                    >
                      −
                    </button>
                    <div className="counter-value">{state.printers[item.key]}</div>
                    <button
                      className="counter-btn"
                      onClick={() => updatePrinterCount(item.key, 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="nav-buttons">
              <button className="nav-btn secondary" onClick={previousStep}>
                ← Previous
              </button>
              <button className="nav-btn primary" onClick={nextStep}>
                Next Step →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Printer Placement */}
        {currentStep === 3 && (
          <div className="card">
            <h2>Printer Placement & Station Assignment</h2>
            <p className="help-text">
              For each printer, specify location, station pairing, and cable
              requirements
            </p>

            {(() => {
              const totalPrinters = state.printers.receipt + state.printers.kitchen + state.printers.label;
              if (totalPrinters === 0) {
                return <p className="help-text">No printers configured. Go back to Step 2 to add printers.</p>;
              }

              let printerIndex = 0;
              const printerForms = [];

              // Receipt printers
              for (let i = 0; i < state.printers.receipt; i++) {
                const idx = printerIndex;
                const placement = state.printersPlacement[idx] || { type: 'receipt' };
                printerForms.push(
                  <div key={`receipt-${i}`} className="printer-card">
                    <div className="printer-header">Receipt Printer #{i + 1}</div>

                    <div className="form-group">
                      <label>Physical Location</label>
                      <select
                        value={placement.location || ''}
                        onChange={(e) => {
                          updatePrinterPlacement(idx, { type: 'receipt', location: e.target.value as LocationType });
                        }}
                      >
                        <option value="">Select location...</option>
                        <option value="front_of_house_counter">Front of House Counter</option>
                        <option value="back_of_house_kitchen">Back of House Kitchen</option>
                        <option value="back_of_house_expeditor">Back of House Expeditor</option>
                        <option value="bar">Bar</option>
                        <option value="back_office">Back Office</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    {placement.location === 'other' && (
                      <div className="form-group">
                        <label>Specify Location</label>
                        <input
                          type="text"
                          placeholder="e.g., Patio Bar"
                          value={placement.locationCustom || ''}
                          onChange={(e) => updatePrinterPlacement(idx, { locationCustom: e.target.value })}
                        />
                      </div>
                    )}

                    <div className="form-group">
                      <label>Paired to Which Station?</label>
                      <select
                        value={placement.stationId || ''}
                        onChange={(e) => updatePrinterPlacement(idx, { stationId: e.target.value })}
                      >
                        <option value="">Select station...</option>
                        {state.stations.map((s, sIdx) => (
                          <option key={s.id} value={s.id.toString()}>Station {sIdx + 1}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Can we run a visible cable from our router to this printer?</label>
                      <div className="button-group">
                        <div
                          className={`button-group-item ${placement.canCable === true ? 'selected' : ''}`}
                          onClick={() => selectPrinterOption(idx, 'canCable', true)}
                        >
                          Yes
                        </div>
                        <div
                          className={`button-group-item ${placement.canCable === false ? 'selected' : ''}`}
                          onClick={() => selectPrinterOption(idx, 'canCable', false)}
                        >
                          No
                        </div>
                      </div>
                    </div>

                    {placement.canCable === true && (
                      <div className="form-group">
                        <label>Cable length from router to printer</label>
                        <p className="help-text">Choose the cable length that will reach from the router directly to the printer</p>
                        <div className="button-group">
                          <div
                            className={`button-group-item ${placement.cableLength === 1 ? 'selected' : ''}`}
                            onClick={() => selectPrinterOption(idx, 'cableLength', 1)}
                          >
                            1M
                          </div>
                          <div
                            className={`button-group-item ${placement.cableLength === 3 ? 'selected' : ''}`}
                            onClick={() => selectPrinterOption(idx, 'cableLength', 3)}
                          >
                            3M
                          </div>
                          <div
                            className={`button-group-item ${placement.cableLength === 5 ? 'selected' : ''}`}
                            onClick={() => selectPrinterOption(idx, 'cableLength', 5)}
                          >
                            5M
                          </div>
                          <div
                            className={`button-group-item ${placement.cableLength === 10 ? 'selected' : ''}`}
                            onClick={() => selectPrinterOption(idx, 'cableLength', 10)}
                          >
                            10M
                          </div>
                          <div
                            className={`button-group-item ${placement.cableLength === 'wifi' ? 'selected' : ''}`}
                            onClick={() => selectPrinterOption(idx, 'cableLength', 'wifi')}
                          >
                            Use WiFi Instead
                          </div>
                        </div>
                      </div>
                    )}

                    {placement.canCable === false && (
                      <div className="form-group">
                        <label>Is there an ethernet outlet at this location?</label>
                        <p className="help-text">An ethernet outlet is a wall-mounted socket (like a power outlet) with in-wall cabling</p>
                        <div className="button-group">
                          <div
                            className={`button-group-item ${placement.hasOutlet === true ? 'selected' : ''}`}
                            onClick={() => selectPrinterOption(idx, 'hasOutlet', true)}
                          >
                            Yes
                          </div>
                          <div
                            className={`button-group-item ${placement.hasOutlet === false ? 'selected' : ''}`}
                            onClick={() => selectPrinterOption(idx, 'hasOutlet', false)}
                          >
                            No
                          </div>
                        </div>
                      </div>
                    )}

                    {placement.canCable === false && placement.hasOutlet === true && (
                      <>
                        <div className="form-group">
                          <label>Cable length from router to ethernet outlet</label>
                          <p className="help-text">First cable segment: Router → Wall Outlet</p>
                          <div className="button-group">
                            <div
                              className={`button-group-item ${placement.routerToOutletCableLength === 1 ? 'selected' : ''}`}
                              onClick={() => selectPrinterOption(idx, 'routerToOutletCableLength', 1)}
                            >
                              1M
                            </div>
                            <div
                              className={`button-group-item ${placement.routerToOutletCableLength === 3 ? 'selected' : ''}`}
                              onClick={() => selectPrinterOption(idx, 'routerToOutletCableLength', 3)}
                            >
                              3M
                            </div>
                            <div
                              className={`button-group-item ${placement.routerToOutletCableLength === 5 ? 'selected' : ''}`}
                              onClick={() => selectPrinterOption(idx, 'routerToOutletCableLength', 5)}
                            >
                              5M
                            </div>
                          </div>
                        </div>

                        <div className="form-group">
                          <label>Cable length from ethernet outlet to printer</label>
                          <p className="help-text">Second cable segment: Wall Outlet → Printer</p>
                          <div className="button-group">
                            <div
                              className={`button-group-item ${placement.outletToPrinterCableLength === 1 ? 'selected' : ''}`}
                              onClick={() => selectPrinterOption(idx, 'outletToPrinterCableLength', 1)}
                            >
                              1M
                            </div>
                            <div
                              className={`button-group-item ${placement.outletToPrinterCableLength === 3 ? 'selected' : ''}`}
                              onClick={() => selectPrinterOption(idx, 'outletToPrinterCableLength', 3)}
                            >
                              3M
                            </div>
                            <div
                              className={`button-group-item ${placement.outletToPrinterCableLength === 5 ? 'selected' : ''}`}
                              onClick={() => selectPrinterOption(idx, 'outletToPrinterCableLength', 5)}
                            >
                              5M
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {((placement.canCable === true && placement.cableLength === 'wifi') || (placement.canCable === false && placement.hasOutlet === false)) && (
                      <div className="form-group">
                        <label>Distance from router location</label>
                        <div className="button-group">
                          <div
                            className={`button-group-item ${placement.distance === 'under10' ? 'selected' : ''}`}
                            onClick={() => selectPrinterOption(idx, 'distance', 'under10')}
                          >
                            &lt; 10M
                          </div>
                          <div
                            className={`button-group-item ${placement.distance === 'over10' ? 'selected' : ''}`}
                            onClick={() => selectPrinterOption(idx, 'distance', 'over10')}
                          >
                            &gt; 10M
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
                printerIndex++;
              }

              // Kitchen printers
              for (let i = 0; i < state.printers.kitchen; i++) {
                const idx = printerIndex;
                const placement = state.printersPlacement[idx] || { type: 'kitchen' };
                printerForms.push(
                  <div key={`kitchen-${i}`} className="printer-card">
                    <div className="printer-header">Kitchen Printer #{i + 1}</div>

                    <div className="form-group">
                      <label>Physical Location</label>
                      <select
                        value={placement.location || ''}
                        onChange={(e) => {
                          updatePrinterPlacement(idx, { type: 'kitchen', location: e.target.value as LocationType });
                        }}
                      >
                        <option value="">Select location...</option>
                        <option value="front_of_house_counter">Front of House Counter</option>
                        <option value="back_of_house_kitchen">Back of House Kitchen</option>
                        <option value="back_of_house_expeditor">Back of House Expeditor</option>
                        <option value="bar">Bar</option>
                        <option value="back_office">Back Office</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    {placement.location === 'other' && (
                      <div className="form-group">
                        <label>Specify Location</label>
                        <input
                          type="text"
                          placeholder="e.g., Patio Bar"
                          value={placement.locationCustom || ''}
                          onChange={(e) => updatePrinterPlacement(idx, { locationCustom: e.target.value })}
                        />
                      </div>
                    )}

                    <div className="form-group">
                      <label>Paired to Which Station?</label>
                      <select
                        value={placement.stationId || ''}
                        onChange={(e) => updatePrinterPlacement(idx, { stationId: e.target.value })}
                      >
                        <option value="">Select station...</option>
                        {state.stations.map((s, sIdx) => (
                          <option key={s.id} value={s.id.toString()}>Station {sIdx + 1}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Can we run a visible cable from our router to this printer?</label>
                      <div className="button-group">
                        <div
                          className={`button-group-item ${placement.canCable === true ? 'selected' : ''}`}
                          onClick={() => selectPrinterOption(idx, 'canCable', true)}
                        >
                          Yes
                        </div>
                        <div
                          className={`button-group-item ${placement.canCable === false ? 'selected' : ''}`}
                          onClick={() => selectPrinterOption(idx, 'canCable', false)}
                        >
                          No
                        </div>
                      </div>
                    </div>

                    {placement.canCable === true && (
                      <div className="form-group">
                        <label>Cable length from router to printer</label>
                        <p className="help-text">Choose the cable length that will reach from the router directly to the printer</p>
                        <div className="button-group">
                          <div
                            className={`button-group-item ${placement.cableLength === 1 ? 'selected' : ''}`}
                            onClick={() => selectPrinterOption(idx, 'cableLength', 1)}
                          >
                            1M
                          </div>
                          <div
                            className={`button-group-item ${placement.cableLength === 3 ? 'selected' : ''}`}
                            onClick={() => selectPrinterOption(idx, 'cableLength', 3)}
                          >
                            3M
                          </div>
                          <div
                            className={`button-group-item ${placement.cableLength === 5 ? 'selected' : ''}`}
                            onClick={() => selectPrinterOption(idx, 'cableLength', 5)}
                          >
                            5M
                          </div>
                          <div
                            className={`button-group-item ${placement.cableLength === 10 ? 'selected' : ''}`}
                            onClick={() => selectPrinterOption(idx, 'cableLength', 10)}
                          >
                            10M
                          </div>
                          <div
                            className={`button-group-item ${placement.cableLength === 'wifi' ? 'selected' : ''}`}
                            onClick={() => selectPrinterOption(idx, 'cableLength', 'wifi')}
                          >
                            Use WiFi Instead
                          </div>
                        </div>
                      </div>
                    )}

                    {placement.canCable === false && (
                      <div className="form-group">
                        <label>Is there an ethernet outlet at this location?</label>
                        <p className="help-text">An ethernet outlet is a wall-mounted socket (like a power outlet) with in-wall cabling</p>
                        <div className="button-group">
                          <div
                            className={`button-group-item ${placement.hasOutlet === true ? 'selected' : ''}`}
                            onClick={() => selectPrinterOption(idx, 'hasOutlet', true)}
                          >
                            Yes
                          </div>
                          <div
                            className={`button-group-item ${placement.hasOutlet === false ? 'selected' : ''}`}
                            onClick={() => selectPrinterOption(idx, 'hasOutlet', false)}
                          >
                            No
                          </div>
                        </div>
                      </div>
                    )}

                    {placement.canCable === false && placement.hasOutlet === true && (
                      <>
                        <div className="form-group">
                          <label>Cable length from router to ethernet outlet</label>
                          <p className="help-text">First cable segment: Router → Wall Outlet</p>
                          <div className="button-group">
                            <div
                              className={`button-group-item ${placement.routerToOutletCableLength === 1 ? 'selected' : ''}`}
                              onClick={() => selectPrinterOption(idx, 'routerToOutletCableLength', 1)}
                            >
                              1M
                            </div>
                            <div
                              className={`button-group-item ${placement.routerToOutletCableLength === 3 ? 'selected' : ''}`}
                              onClick={() => selectPrinterOption(idx, 'routerToOutletCableLength', 3)}
                            >
                              3M
                            </div>
                            <div
                              className={`button-group-item ${placement.routerToOutletCableLength === 5 ? 'selected' : ''}`}
                              onClick={() => selectPrinterOption(idx, 'routerToOutletCableLength', 5)}
                            >
                              5M
                            </div>
                          </div>
                        </div>

                        <div className="form-group">
                          <label>Cable length from ethernet outlet to printer</label>
                          <p className="help-text">Second cable segment: Wall Outlet → Printer</p>
                          <div className="button-group">
                            <div
                              className={`button-group-item ${placement.outletToPrinterCableLength === 1 ? 'selected' : ''}`}
                              onClick={() => selectPrinterOption(idx, 'outletToPrinterCableLength', 1)}
                            >
                              1M
                            </div>
                            <div
                              className={`button-group-item ${placement.outletToPrinterCableLength === 3 ? 'selected' : ''}`}
                              onClick={() => selectPrinterOption(idx, 'outletToPrinterCableLength', 3)}
                            >
                              3M
                            </div>
                            <div
                              className={`button-group-item ${placement.outletToPrinterCableLength === 5 ? 'selected' : ''}`}
                              onClick={() => selectPrinterOption(idx, 'outletToPrinterCableLength', 5)}
                            >
                              5M
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {((placement.canCable === true && placement.cableLength === 'wifi') || (placement.canCable === false && placement.hasOutlet === false)) && (
                      <div className="form-group">
                        <label>Distance from router location</label>
                        <div className="button-group">
                          <div
                            className={`button-group-item ${placement.distance === 'under10' ? 'selected' : ''}`}
                            onClick={() => selectPrinterOption(idx, 'distance', 'under10')}
                          >
                            &lt; 10M
                          </div>
                          <div
                            className={`button-group-item ${placement.distance === 'over10' ? 'selected' : ''}`}
                            onClick={() => selectPrinterOption(idx, 'distance', 'over10')}
                          >
                            &gt; 10M
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
                printerIndex++;
              }

              // Label printers
              for (let i = 0; i < state.printers.label; i++) {
                const idx = printerIndex;
                const placement = state.printersPlacement[idx] || { type: 'label' };
                printerForms.push(
                  <div key={`label-${i}`} className="printer-card">
                    <div className="printer-header">Label Printer #{i + 1}</div>

                    <div className="form-group">
                      <label>Physical Location</label>
                      <select
                        value={placement.location || ''}
                        onChange={(e) => {
                          updatePrinterPlacement(idx, { type: 'label', location: e.target.value as LocationType });
                        }}
                      >
                        <option value="">Select location...</option>
                        <option value="front_of_house_counter">Front of House Counter</option>
                        <option value="back_of_house_kitchen">Back of House Kitchen</option>
                        <option value="back_of_house_expeditor">Back of House Expeditor</option>
                        <option value="bar">Bar</option>
                        <option value="back_office">Back Office</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    {placement.location === 'other' && (
                      <div className="form-group">
                        <label>Specify Location</label>
                        <input
                          type="text"
                          placeholder="e.g., Patio Bar"
                          value={placement.locationCustom || ''}
                          onChange={(e) => updatePrinterPlacement(idx, { locationCustom: e.target.value })}
                        />
                      </div>
                    )}

                    <div className="form-group">
                      <label>Paired to Which Station?</label>
                      <select
                        value={placement.stationId || ''}
                        onChange={(e) => updatePrinterPlacement(idx, { stationId: e.target.value })}
                      >
                        <option value="">Select station...</option>
                        {state.stations.map((s, sIdx) => (
                          <option key={s.id} value={s.id.toString()}>Station {sIdx + 1}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Can we run a visible cable from our router to this printer?</label>
                      <div className="button-group">
                        <div
                          className={`button-group-item ${placement.canCable === true ? 'selected' : ''}`}
                          onClick={() => selectPrinterOption(idx, 'canCable', true)}
                        >
                          Yes
                        </div>
                        <div
                          className={`button-group-item ${placement.canCable === false ? 'selected' : ''}`}
                          onClick={() => selectPrinterOption(idx, 'canCable', false)}
                        >
                          No
                        </div>
                      </div>
                    </div>

                    {placement.canCable === true && (
                      <div className="form-group">
                        <label>Cable length from router to printer</label>
                        <p className="help-text">Choose the cable length that will reach from the router directly to the printer</p>
                        <div className="button-group">
                          <div
                            className={`button-group-item ${placement.cableLength === 1 ? 'selected' : ''}`}
                            onClick={() => selectPrinterOption(idx, 'cableLength', 1)}
                          >
                            1M
                          </div>
                          <div
                            className={`button-group-item ${placement.cableLength === 3 ? 'selected' : ''}`}
                            onClick={() => selectPrinterOption(idx, 'cableLength', 3)}
                          >
                            3M
                          </div>
                          <div
                            className={`button-group-item ${placement.cableLength === 5 ? 'selected' : ''}`}
                            onClick={() => selectPrinterOption(idx, 'cableLength', 5)}
                          >
                            5M
                          </div>
                          <div
                            className={`button-group-item ${placement.cableLength === 10 ? 'selected' : ''}`}
                            onClick={() => selectPrinterOption(idx, 'cableLength', 10)}
                          >
                            10M
                          </div>
                          <div
                            className={`button-group-item ${placement.cableLength === 'wifi' ? 'selected' : ''}`}
                            onClick={() => selectPrinterOption(idx, 'cableLength', 'wifi')}
                          >
                            Use WiFi Instead
                          </div>
                        </div>
                      </div>
                    )}

                    {placement.canCable === false && (
                      <div className="form-group">
                        <label>Is there an ethernet outlet at this location?</label>
                        <p className="help-text">An ethernet outlet is a wall-mounted socket (like a power outlet) with in-wall cabling</p>
                        <div className="button-group">
                          <div
                            className={`button-group-item ${placement.hasOutlet === true ? 'selected' : ''}`}
                            onClick={() => selectPrinterOption(idx, 'hasOutlet', true)}
                          >
                            Yes
                          </div>
                          <div
                            className={`button-group-item ${placement.hasOutlet === false ? 'selected' : ''}`}
                            onClick={() => selectPrinterOption(idx, 'hasOutlet', false)}
                          >
                            No
                          </div>
                        </div>
                      </div>
                    )}

                    {placement.canCable === false && placement.hasOutlet === true && (
                      <>
                        <div className="form-group">
                          <label>Cable length from router to ethernet outlet</label>
                          <p className="help-text">First cable segment: Router → Wall Outlet</p>
                          <div className="button-group">
                            <div
                              className={`button-group-item ${placement.routerToOutletCableLength === 1 ? 'selected' : ''}`}
                              onClick={() => selectPrinterOption(idx, 'routerToOutletCableLength', 1)}
                            >
                              1M
                            </div>
                            <div
                              className={`button-group-item ${placement.routerToOutletCableLength === 3 ? 'selected' : ''}`}
                              onClick={() => selectPrinterOption(idx, 'routerToOutletCableLength', 3)}
                            >
                              3M
                            </div>
                            <div
                              className={`button-group-item ${placement.routerToOutletCableLength === 5 ? 'selected' : ''}`}
                              onClick={() => selectPrinterOption(idx, 'routerToOutletCableLength', 5)}
                            >
                              5M
                            </div>
                          </div>
                        </div>

                        <div className="form-group">
                          <label>Cable length from ethernet outlet to printer</label>
                          <p className="help-text">Second cable segment: Wall Outlet → Printer</p>
                          <div className="button-group">
                            <div
                              className={`button-group-item ${placement.outletToPrinterCableLength === 1 ? 'selected' : ''}`}
                              onClick={() => selectPrinterOption(idx, 'outletToPrinterCableLength', 1)}
                            >
                              1M
                            </div>
                            <div
                              className={`button-group-item ${placement.outletToPrinterCableLength === 3 ? 'selected' : ''}`}
                              onClick={() => selectPrinterOption(idx, 'outletToPrinterCableLength', 3)}
                            >
                              3M
                            </div>
                            <div
                              className={`button-group-item ${placement.outletToPrinterCableLength === 5 ? 'selected' : ''}`}
                              onClick={() => selectPrinterOption(idx, 'outletToPrinterCableLength', 5)}
                            >
                              5M
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {((placement.canCable === true && placement.cableLength === 'wifi') || (placement.canCable === false && placement.hasOutlet === false)) && (
                      <div className="form-group">
                        <label>Distance from router location</label>
                        <div className="button-group">
                          <div
                            className={`button-group-item ${placement.distance === 'under10' ? 'selected' : ''}`}
                            onClick={() => selectPrinterOption(idx, 'distance', 'under10')}
                          >
                            &lt; 10M
                          </div>
                          <div
                            className={`button-group-item ${placement.distance === 'over10' ? 'selected' : ''}`}
                            onClick={() => selectPrinterOption(idx, 'distance', 'over10')}
                          >
                            &gt; 10M
                          </div>
                        </div>
                      </div>
                    )}

                    {placement.type === 'label' && ((placement.canCable === true && placement.cableLength === 'wifi') || (placement.canCable === false && placement.hasOutlet === false)) && (
                      <div className="warning">
                        ⚠️ WARNING: Label printers (ZD411) require a wired LAN connection and cannot use WiFi. You must select a cable option or use an ethernet outlet for this printer to function.
                      </div>
                    )}
                  </div>
                );
                printerIndex++;
              }

              return printerForms;
            })()}

            <div className="nav-buttons">
              <button className="nav-btn secondary" onClick={previousStep}>
                ← Previous
              </button>
              <button className="nav-btn primary" onClick={nextStep}>
                Next Step →
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Infrastructure */}
        {currentStep === 4 && (
          <div className="card">
            <h2>Infrastructure</h2>

            <div className="form-group">
              <label>Does the customer have an existing internet connection (ISP)?</label>
              <div className="button-group">
                <div
                  className={`button-group-item ${
                    state.infrastructure.hasInternet === true ? 'selected' : ''
                  }`}
                  onClick={() => selectInfraOption('hasInternet', true)}
                >
                  Yes, ISP Connection
                </div>
                <div
                  className={`button-group-item ${
                    state.infrastructure.hasInternet === false ? 'selected' : ''
                  }`}
                  onClick={() => selectInfraOption('hasInternet', false)}
                >
                  No, Need SIM Card
                </div>
              </div>
            </div>

            {state.infrastructure.hasInternet === true && (
              <div>
                <div className="form-group">
                  <label>Where will the Waffle router be located?</label>
                  <select
                    value={state.infrastructure.routerLocation || ''}
                    onChange={(e) => updateInfraField('routerLocation', e.target.value)}
                  >
                    <option value="">Select location...</option>
                    <option value="front_of_house">Front of House</option>
                    <option value="back_of_house">Back of House</option>
                    <option value="back_office">Back Office</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Does the customer's ISP router have at least 1 available LAN port for our use?</label>
                  <p className="help-text">We need to connect our Waffle router to their ISP router via 1 LAN port</p>
                  <div className="button-group">
                    <div
                      className={`button-group-item ${
                        state.infrastructure.hasPort === true ? 'selected' : ''
                      }`}
                      onClick={() => selectInfraOption('hasPort', true)}
                    >
                      Yes
                    </div>
                    <div
                      className={`button-group-item ${
                        state.infrastructure.hasPort === false ? 'selected' : ''
                      }`}
                      onClick={() => selectInfraOption('hasPort', false)}
                    >
                      No / Not Sure
                    </div>
                  </div>
                </div>

                {state.infrastructure.hasPort === false && (
                  <div className="warning">
                    ⚠️ Please communicate to the customer that we need at least 1 LAN port from their ISP router to connect our Waffle router ecosystem. If they don't have any available ports, they'll need to contact their ISP or use our SIM card option instead.
                  </div>
                )}
              </div>
            )}

            {state.infrastructure.hasInternet === false && (
              <div>
                <div className="form-group">
                  <label>SIM Card Provider</label>
                  <select
                    value={state.infrastructure.simProvider || ''}
                    onChange={(e) => updateInfraField('simProvider', e.target.value)}
                  >
                    <option value="">Select provider...</option>
                    <option value="singtel_heya">Singtel Heya (Recommended)</option>
                    <option value="m1_maxx">M1 Maxx (Recommended)</option>
                    <option value="starhub_prepaid">Starhub Prepaid (Recommended)</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {state.infrastructure.simProvider === 'other' && (
                  <div>
                    <div className="form-group">
                      <label>Specify SIM Provider</label>
                      <input
                        type="text"
                        placeholder="e.g., Circles Life, TPG"
                        value={state.infrastructure.simProviderOther || ''}
                        onChange={(e) => updateInfraField('simProviderOther', e.target.value)}
                      />
                    </div>
                    <div className="warning">
                      ⚠️ Non-recommended SIM providers (Circles Life, TPG) may have network compatibility issues with our routers. Verify with customer before proceeding.
                    </div>
                  </div>
                )}

                <div className="info" style={{marginTop: '12px'}}>
                  ℹ️ Note: Our MR505 router requires a physical SIM card (no eSIM support). Ensure the SIM card is the correct size.
                </div>
              </div>
            )}

            <div className="nav-buttons">
              <button className="nav-btn secondary" onClick={previousStep}>
                ← Previous
              </button>
              <button className="nav-btn primary" onClick={nextStep}>
                Next Step →
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Review */}
        {currentStep === 5 && (
          <div className="card">
            <h2>Order Summary</h2>

            <div className="review-section">
              <h3>Customer</h3>
              <div className="review-item">
                <strong>{state.customerName || 'Not specified'}</strong>
              </div>
            </div>

            <div className="review-section">
              <h3>POS Stations</h3>
              {state.stations.map((station, idx) => (
                <div key={station.id}>
                  <div className="review-item"><strong>Station {idx + 1}</strong></div>
                  {station.hasPOS && <div className="review-item review-item-indent">1x iPad (POS)</div>}
                  {station.hasCDS && <div className="review-item review-item-indent">1x iPad (CDS)</div>}
                </div>
              ))}
            </div>

            {(state.peripherals.stands > 0 || state.peripherals.drawers > 0 || state.peripherals.readers > 0) && (
              <div className="review-section">
                <h3>Peripherals</h3>
                {(() => {
                  let standsRemaining = state.peripherals.stands || 0;
                  let drawersRemaining = state.peripherals.drawers || 0;
                  let readersRemaining = state.peripherals.readers || 0;

                  const allocations = state.stations.map((station, idx) => {
                    const stationPeripherals = [];

                    if (standsRemaining > 0 && (station.hasPOS || station.hasCDS)) {
                      stationPeripherals.push('1x POS Stand');
                      standsRemaining--;
                    }

                    if (drawersRemaining > 0) {
                      stationPeripherals.push('1x Cash Drawer');
                      drawersRemaining--;
                    }

                    if (readersRemaining > 0 && station.hasPOS) {
                      stationPeripherals.push('1x Card Reader');
                      readersRemaining--;
                    }

                    return stationPeripherals.length > 0 ? (
                      <div key={idx}>
                        <div className="review-item"><strong>Station {idx + 1}:</strong></div>
                        {stationPeripherals.map((item, i) => (
                          <div key={i} className="review-item review-item-indent">{item}</div>
                        ))}
                      </div>
                    ) : null;
                  });

                  return (
                    <>
                      {allocations}
                      {(standsRemaining > 0 || drawersRemaining > 0 || readersRemaining > 0) && (
                        <div style={{marginTop: '12px'}}>
                          <div className="review-item"><strong>Unallocated (spares):</strong></div>
                          {standsRemaining > 0 && <div className="review-item review-item-indent">{standsRemaining}x POS Stand{standsRemaining > 1 ? 's' : ''}</div>}
                          {drawersRemaining > 0 && <div className="review-item review-item-indent">{drawersRemaining}x Cash Drawer{drawersRemaining > 1 ? 's' : ''}</div>}
                          {readersRemaining > 0 && <div className="review-item review-item-indent">{readersRemaining}x Card Reader{readersRemaining > 1 ? 's' : ''}</div>}
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            )}

            {(() => {
              const printersByLocation: { [key: string]: any[] } = {};

              state.printersPlacement.forEach(placement => {
                if (placement && placement.location) {
                  const loc = placement.location === 'other' ? (placement.locationCustom || 'Other') : formatLocation(placement.location);
                  if (loc) {
                    if (!printersByLocation[loc]) {
                      printersByLocation[loc] = [];
                    }

                    printersByLocation[loc].push({
                      type: placement.type || 'unknown',
                      placement: placement,
                      stationName: getStationName(placement.stationId)
                    });
                  }
                }
              });

              return Object.keys(printersByLocation).length > 0 ? (
                <div className="review-section">
                  <h3>Printers</h3>
                  {Object.keys(printersByLocation).map(location => (
                    <div key={location}>
                      <div className="review-item"><strong>{location}</strong></div>
                      {printersByLocation[location].map((printer, idx) => {
                        const model = getPrinterModel(printer.type, printer.placement);
                        const connection = getPrinterConnection(printer.placement);
                        const typeLabel = printer.type.charAt(0).toUpperCase() + printer.type.slice(1);
                        return (
                          <div key={idx} className="review-item review-item-indent">
                            1x {model} {typeLabel} ({connection}, paired to {printer.stationName})
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              ) : null;
            })()}

            <div className="review-section">
              <h3>Network Equipment</h3>
              {(() => {
                const network = calculateNetworkEquipment();
                return (
                  <>
                    <div className="review-item">{network.router}</div>
                    {network.switch && <div className="review-item">{network.switch}</div>}
                    {network.cables && <div className="review-item">{network.cables}</div>}
                  </>
                );
              })()}
            </div>

            <div className="review-section">
              <h3>Installation Complexity</h3>
              <div
                className={`complexity-badge complexity-${calculateComplexity().level.toLowerCase()}`}
              >
                {calculateComplexity().level} - {calculateComplexity().time}
              </div>
            </div>

            <div className="info" style={{marginTop: '24px'}}>
              ℹ️ <strong>Important:</strong> Ensure sufficient power points are available at each printer location. Each printer requires its own dedicated power outlet.
            </div>

            <button className="copy-btn" onClick={copyToClipboard}>
              📋 Copy Order to Clipboard
            </button>

            <button
              className="notion-btn"
              onClick={updateNotionDatabase}
              disabled={notionLoading}
            >
              {notionLoading ? 'Updating Notion...' : '📝 Update on Notion DB'}
            </button>

            {notionMessage && (
              <div
                className={
                  notionMessage.type === 'success'
                    ? 'success-message'
                    : 'error-message'
                }
              >
                {notionMessage.text}
              </div>
            )}

            <div className="nav-buttons">
              <button className="nav-btn secondary" onClick={previousStep}>
                ← Previous
              </button>
              <button className="nav-btn primary" onClick={startNewOrder}>
                Start New Order
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }

        .header {
          background: white;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .header h1 {
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .header p {
          color: #71717a;
          font-size: 14px;
        }

        .customer-name-section {
          background: white;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .customer-name-section label {
          display: block;
          font-weight: 500;
          margin-bottom: 8px;
          font-size: 14px;
        }

        .customer-name-section input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #e4e4e7;
          border-radius: 8px;
          font-size: 16px;
          font-family: inherit;
        }

        .progress-bar {
          background: white;
          border-radius: 12px;
          padding: 16px 20px;
          margin-bottom: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          position: sticky;
          top: 20px;
          z-index: 100;
        }

        .progress-steps {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
        }

        .progress-step {
          flex: 1;
          text-align: center;
          padding: 8px 4px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          color: #a1a1aa;
          background: #fafafa;
        }

        .progress-step.active {
          background: #0a0a0a;
          color: white;
        }

        .progress-step.completed {
          background: #f0fdf4;
          color: #166534;
        }

        .card {
          background: white;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 16px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .card h2 {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 16px;
        }

        .card h3 {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 12px;
          margin-top: 20px;
        }

        .station-card {
          border: 1px solid #e4e4e7;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 12px;
        }

        .station-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .station-title {
          font-weight: 600;
          font-size: 15px;
        }

        .remove-station-btn {
          background: #fef2f2;
          color: #991b1b;
          border: none;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 13px;
          cursor: pointer;
          font-weight: 500;
        }

        .checkbox-group {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 12px;
        }

        .checkbox-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .checkbox-item input[type='checkbox'] {
          width: 20px;
          height: 20px;
          cursor: pointer;
        }

        .checkbox-item label {
          font-size: 14px;
          cursor: pointer;
          user-select: none;
        }

        .counter-group {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .counter-item {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .counter-label {
          font-size: 14px;
          font-weight: 500;
        }

        .counter-controls {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .counter-btn {
          width: 36px;
          height: 36px;
          border: 1px solid #e4e4e7;
          background: white;
          border-radius: 6px;
          font-size: 18px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 500;
          transition: all 0.2s;
        }

        .counter-btn:hover {
          background: #fafafa;
        }

        .counter-value {
          font-size: 16px;
          font-weight: 600;
          min-width: 30px;
          text-align: center;
        }

        .add-btn {
          background: #f0fdf4;
          color: #166534;
          border: 1px solid #bbf7d0;
          padding: 12px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          width: 100%;
          margin-top: 12px;
        }

        .warning {
          background: #fff7ed;
          border: 1px solid #fed7aa;
          color: #9a3412;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 14px;
          margin-top: 12px;
          line-height: 1.5;
        }

        .help-text {
          font-size: 13px;
          color: #71717a;
          margin-bottom: 16px;
        }

        .info {
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          color: #1e40af;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 14px;
          margin-top: 12px;
        }

        .nav-buttons {
          display: flex;
          gap: 12px;
          margin-top: 24px;
        }

        .nav-btn {
          flex: 1;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
        }

        .nav-btn.primary {
          background: #0a0a0a;
          color: white;
        }

        .nav-btn.primary:hover {
          background: #18181b;
        }

        .nav-btn.secondary {
          background: white;
          color: #0a0a0a;
          border: 1px solid #e4e4e7;
        }

        .nav-btn.secondary:hover {
          background: #fafafa;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          font-weight: 500;
          margin-bottom: 8px;
          font-size: 14px;
        }

        .form-group select {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #e4e4e7;
          border-radius: 8px;
          font-size: 16px;
          font-family: inherit;
          background: white;
        }

        .form-group input[type="text"] {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #e4e4e7;
          border-radius: 8px;
          font-size: 16px;
          font-family: inherit;
        }

        .button-group {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .button-group-item {
          flex: 1;
          min-width: 120px;
          padding: 10px 16px;
          border: 1px solid #e4e4e7;
          background: white;
          border-radius: 8px;
          cursor: pointer;
          text-align: center;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
        }

        .button-group-item:hover {
          background: #fafafa;
        }

        .button-group-item.selected {
          background: #0a0a0a;
          color: white;
          border-color: #0a0a0a;
        }

        .printer-card {
          border: 1px solid #e4e4e7;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 12px;
        }

        .printer-header {
          font-weight: 600;
          margin-bottom: 12px;
          color: #0a0a0a;
        }

        .review-section {
          margin-bottom: 24px;
        }

        .review-section h3 {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 2px solid #e4e4e7;
        }

        .review-item {
          padding: 8px 0;
          font-size: 14px;
        }

        .review-item-indent {
          padding-left: 20px;
          color: #71717a;
        }

        .complexity-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          margin-top: 8px;
        }

        .complexity-low {
          background: #f0fdf4;
          color: #166534;
        }

        .complexity-medium {
          background: #fef3c7;
          color: #92400e;
        }

        .complexity-high {
          background: #fef2f2;
          color: #991b1b;
        }

        .copy-btn {
          background: #0a0a0a;
          color: white;
          border: none;
          padding: 14px 24px;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          width: 100%;
          margin-top: 16px;
        }

        .copy-btn:hover {
          background: #18181b;
        }

        .notion-btn {
          background: white;
          color: #0a0a0a;
          border: 2px solid #0a0a0a;
          padding: 14px 24px;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          width: 100%;
          margin-top: 12px;
        }

        .notion-btn:hover {
          background: #fafafa;
        }

        .notion-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .success-message {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          color: #166534;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 14px;
          margin-top: 12px;
        }

        .error-message {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #991b1b;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 14px;
          margin-top: 12px;
        }
      `}</style>

      <style jsx global>{`
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
            'Helvetica Neue', Arial, sans-serif;
          background: #fafafa;
          color: #0a0a0a;
          font-size: 16px;
          line-height: 1.5;
          padding-bottom: 40px;
        }
      `}</style>
    </>
  );
}
