// A dummy Windows/Linux app menu, in the shape Electron sends it, shown when simulating Electron outside production so
// the menu can be checked across themes and contrast levels. Covers every kind of entry ElectronUI renders or filters out

export const devElectronMenu = [
  { label: 'Chromatix', submenu: [{ role: 'about' }, { type: 'separator' }, { role: 'quit' }] },
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'togglefullscreen' },
      { role: 'hide' },
      { type: 'separator' },
      { label: 'Zoom In', webAction: 'zoom-in' },
      { label: 'Zoom Out', webAction: 'zoom-out' },
    ],
  },
  {
    label: 'Settings',
    submenu: [
      { label: 'Launch At Login', type: 'checkbox', checked: true },
      { label: 'Minimise To Tray', type: 'checkbox', checked: false },
      { label: 'Updates', webAction: 'check-for-updates', enabled: false },
      { label: 'Some settings apply after a restart' },
    ],
  },
  { label: 'Help', submenu: [{ label: 'Learn More', webAction: 'learn-more' }] },
];
