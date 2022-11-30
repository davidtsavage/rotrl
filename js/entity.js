class Entity {
  constructor(x, y, z, mapI, height, width, fgColour, bgColour, glyph, fovRange) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.mapI = mapI;
    this.height = height;
    this.width = width;
    this.fgColour = fgColour;
    this.bgColour = bgColour;
    this.glyph = glyph;
    this.fovRange = fovRange;
  };
};