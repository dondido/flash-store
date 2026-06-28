const mappingTable = {
  deadZones: {
    'Xbox 360 Wired Controller': {
      'left-stick': 0.24,
      'right-stick': 0.27,
      'left-trigger': 0.12,
      'right-trigger': 0.12
    },
    RetroLink: {
      'left-stick': 0.2,
      'right-stick': 0.2,
      'left-trigger': 0.1,
      'right-trigger': 0.1
    }
  },
  'Xbox 360 Wired Controller (STANDARD GAMEPAD Vendor: 045e Product: 028e)-standard': {
    deadZone: 'Xbox 360 Wired Controller',
    axes: [
      { id: 'left-stick', prop: 'x' },
      { id: 'left-stick', prop: 'y' },
      { id: 'right-stick', prop: 'x' },
      { id: 'right-stick', prop: 'y' }
    ],
    buttons: [
      'face-bottom',
      'face-right',
      'face-left',
      'face-top',
      'left-shoulder',
      'right-shoulder',
      'left-trigger',
      'right-trigger',
      'select-back',
      'start-forward',
      'left-stick-button',
      'right-stick-button',
      'up',
      'down',
      'left',
      'right',
      'home'
    ]
  },
  '45e-28e-Xbox 360 Wired Controller-': {
    deadZone: 'Xbox 360 Wired Controller',
    axes: [
      { id: 'left-stick', prop: 'x' },
      { id: 'left-stick', prop: 'y' },
      { id: 'left-trigger' },
      { id: 'right-stick', prop: 'x' },
      { id: 'right-stick', prop: 'y' },
      { id: 'right-trigger' }
    ],
    buttons: [
      'up',
      'down',
      'left',
      'right',
      'start-forward',
      'select-back',
      'left-stick-button',
      'right-stick-button',
      'left-shoulder',
      'right-shoulder',
      'home',
      'face-bottom',
      'face-right',
      'face-left',
      'face-top'
    ]
  },
  'Generic   USB  Joystick   (STANDARD GAMEPAD Vendor: 0079 Product: 0006)-standard': {
    description: 'RetroLink gamecube Controller',
    deadZone: 'RetroLink',
    axes: [
      { id: 'right-stick', prop: 'x' },
      { id: 'right-stick', prop: 'y' },
      { id: 'left-stick', prop: 'x' },
      { id: 'left-stick', prop: 'y' }
    ],
    buttons: [
      'face-top',
      'face-right',
      'face-bottom',
      'face-left',
      'left-trigger',
      'right-trigger',
      'right-shoulder',
      'unknown',
      'unknown',
      'home',
      'unknown',
      'unknown',
      'up',
      'down',
      'left',
      'right'
    ]
  },
  standard: {
    deadZone: 'Xbox 360 Wired Controller',
    axes: [
      { id: 'left-stick', prop: 'x' },
      { id: 'left-stick', prop: 'y' },
      { id: 'right-stick', prop: 'x' },
      { id: 'right-stick', prop: 'y' }
    ],
    buttons: [
      'face-bottom',
      'face-right',
      'face-left',
      'face-top',
      'left-shoulder',
      'right-shoulder',
      'left-trigger',
      'right-trigger',
      'select-back',
      'start-forward',
      'left-stick-button',
      'right-stick-button',
      'up',
      'down',
      'left',
      'right',
      'home'
    ]
  }
};

export function raw(scalar) {
  return scalar;
}

export function normalise(scalar, deadzone = 0) {
  if (scalar === 0) {
    return scalar;
  }

  const absScalar = Math.abs(scalar);
  const normalised = (absScalar - deadzone) / (1 - deadzone);

  return scalar < 0 ? -normalised : normalised;
}

export function axial(scalar, deadzone = 0, post = raw) {
  const magnitude = Math.sqrt(scalar * scalar);

  if (magnitude <= deadzone) {
    return 0;
  }

  if (magnitude > 1) {
    return scalar < 0 ? -1 : 1;
  }

  return scalar < 0 ? -post(magnitude, deadzone) : post(magnitude, deadzone);
}

export function radial(coord, deadzone = 0, post = raw) {
  const angle = Math.atan2(coord.y, coord.x);
  let magnitude = Math.sqrt(coord.x * coord.x + coord.y * coord.y);

  if (magnitude <= deadzone) {
    return { x: 0, y: 0 };
  }

  if (magnitude > 1) {
    magnitude = 1;
  }

  return {
    x: Math.cos(angle) * post(magnitude, deadzone),
    y: Math.sin(angle) * post(magnitude, deadzone)
  };
}

function snapToRadian(coord, deadzone, axes, post = raw) {
  const angle = Math.atan2(coord.y, coord.x);
  const snapRadians = Math.PI / axes;
  const newAngle = snapRadians * Math.round(angle / snapRadians);
  let magnitude = Math.sqrt(coord.x * coord.x + coord.y * coord.y);

  if (magnitude <= deadzone) {
    return { x: 0, y: 0 };
  }

  if (magnitude > 1) {
    magnitude = 1;
  }

  return {
    x: Math.cos(newAngle) * post(magnitude, deadzone),
    y: Math.sin(newAngle) * post(magnitude, deadzone)
  };
}

export function way8(coord, deadzone = 0, post = raw) {
  return snapToRadian(coord, deadzone, 4, post);
}

export function way4(coord, deadzone = 0, post = raw) {
  return snapToRadian(coord, deadzone, 2, post);
}

export function vertical(coord, deadzone, post = raw) {
  return {
    x: 0,
    y: snapToRadian(coord, deadzone, 2, post).y
  };
}

export function horizontal(coord, deadzone, post = raw) {
  return {
    x: snapToRadian(coord, deadzone, 2, post).x,
    y: 0
  };
}

export function getMapping(id, mapping) {
  let deviceMap = mappingTable[`${id}-${mapping}`];
  if (!deviceMap) {
    deviceMap = mappingTable[mapping];
  }
  if (!deviceMap) {
    deviceMap = mappingTable.standard;
  }

  return deviceMap;
}

export const deadZones = mappingTable.deadZones;
export { normalise as normalize };

export function axialVector(coord, deadzone, post) {
  return {
    x: axial(coord.x, deadzone, post),
    y: axial(coord.y, deadzone, post)
  };
}

const postMapping = {
  raw,
  normalised: normalise,
  normalized: normalise
};

const algorithms = {
  axial: axialVector,
  radial,
  '8-way': way8,
  '4-way': way4,
  horizontal,
  vertical
};

function build(algorithm, mapper = postMapping.normalised) {
  return function applyAlgorithmAndMapping(coord, deadzone) {
    return algorithm(coord, deadzone, mapper);
  };
}

export function getDeadzoneAlgorithm(algorithm, mapper) {
  return build(algorithms[algorithm], postMapping[mapper]);
}

export default {
  getMapping,
  getDeadzoneAlgorithm,
  deadZones,
  raw,
  normalise,
  normalize: normalise,
  axial,
  radial,
  way8,
  way4,
  vertical,
  horizontal,
  axialVector
};
