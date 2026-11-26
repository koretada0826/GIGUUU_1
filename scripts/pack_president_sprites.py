"""Pack Blender-rendered frames into transparent WebP animation strips."""
import json, sys
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'assets/concierge'/(sys.argv[1] if len(sys.argv)>1 else 'president-walker')
meta=json.loads((OUT/'animation.json').read_text())
for state,info in meta['states'].items():
 frames=[Image.open(OUT/'frames'/f'{state}-{n:02d}.png').convert('RGBA') for n in range(info['frames'])]
 strip=Image.new('RGBA',(meta['width']*len(frames),meta['height']))
 for n,im in enumerate(frames):strip.paste(im,(n*meta['width'],0))
 strip.save(OUT/f'{state}.webp',lossless=True,method=6)
 print(state,(OUT/f'{state}.webp').stat().st_size)
Image.open(OUT/'frames/idle-00.png').save(OUT/'poster.webp',lossless=True,method=6)
# The contact sheet is only for inspecting the authored 3D animation.
contact=Image.new('RGBA',(256*4,384*2),(234,246,248,255))
for i,(state,n) in enumerate([('idle',0),('walk',0),('walk',3),('walk',6),('walk',9),('talk',2),('wave',0),('wave',4)]):
 im=Image.open(OUT/'frames'/f'{state}-{n:02d}.png').convert('RGBA');contact.alpha_composite(im,((i%4)*256,(i//4)*384))
contact.convert('RGB').save(OUT/'contact-sheet.jpg',quality=90)
