"""Build a rigged miniature president, GLB and transparent animation frames.
blender -b --python scripts/build_president_walker.py -- preview|render
"""
import bpy, math, sys, json
from pathlib import Path
from mathutils import Vector, Quaternion
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'assets/concierge/president-walker'
OUT.mkdir(parents=True,exist_ok=True)
FRAMES=OUT/'frames'; FRAMES.mkdir(exist_ok=True)
MODE=sys.argv[sys.argv.index('--')+1] if '--' in sys.argv else 'preview'
bpy.ops.wm.read_factory_settings(use_empty=True)
scene=bpy.context.scene
scene.render.engine='CYCLES'
scene.cycles.samples=24
scene.cycles.use_denoising=True
scene.render.film_transparent=True
scene.render.resolution_x=256;scene.render.resolution_y=384;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG';scene.render.image_settings.color_mode='RGBA'
scene.render.fps=12
scene.view_settings.view_transform='Standard'
world=bpy.data.worlds.new('Soft studio');scene.world=world;world.use_nodes=True
world.node_tree.nodes['Background'].inputs[0].default_value=(.78,.84,.86,1)
world.node_tree.nodes['Background'].inputs[1].default_value=.55

def mat(name,color,rough=.55):
 m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True
 bs=m.node_tree.nodes.get('Principled BSDF');bs.inputs['Base Color'].default_value=(*color,1);bs.inputs['Roughness'].default_value=rough
 return m
skin=mat('Warm skin',(.72,.40,.25)); blush=mat('Cheeks',(.78,.32,.23))
white=mat('Ivory T-shirt',(.91,.94,.93)); shoes=mat('White sneakers',(.85,.89,.89)); navy=mat('Navy trousers',(.025,.06,.10))
hair=mat('Chestnut hair',(.055,.025,.014));hairlight=mat('Hair highlights',(.12,.06,.031));eye=mat('Dark brown eyes',(.025,.016,.012),.25)
eye_white=mat('Eyes white',(.99,.97,.92)); mouth=mat('Smile',(.16,.043,.028)); gold=mat('Gold earring',(.65,.38,.07),.28)
rig=bpy.data.armatures.new('President skeleton');arm=bpy.data.objects.new('President_Rig',rig);bpy.context.collection.objects.link(arm)
bpy.context.view_layer.objects.active=arm;arm.select_set(True);bpy.ops.object.mode_set(mode='EDIT')
bones={
 'root':((0,0,.05),(0,0,.25),None),
 'body':((0,0,.9),(0,0,1.48),'root'),
 'head':((0,0,1.48),(0,0,2.34),'body'),
}
for side,sgn in [('L',-1),('R',1)]:
 bones['upper_arm.'+side]=((sgn*.31,0,1.43),(sgn*.45,-.015,1.13),'body')
 bones['forearm.'+side]=((sgn*.45,-.015,1.13),(sgn*.47,-.05,.94),'upper_arm.'+side)
 bones['thigh.'+side]=((sgn*.155,0,.91),(sgn*.16,0,.53),'root')
 bones['shin.'+side]=((sgn*.16,0,.53),(sgn*.16,0,.16),'thigh.'+side)
 bones['foot.'+side]=((sgn*.16,0,.16),(sgn*.16,-.17,.12),'shin.'+side)
for name,(a,b,parent) in bones.items():
 eb=rig.edit_bones.new(name);eb.head=a;eb.tail=b
 if parent:eb.parent=rig.edit_bones[parent]
bpy.ops.object.mode_set(mode='OBJECT');arm.select_set(False)
parts=[]
def bind(obj,bone):
 vg=obj.vertex_groups.new(name=bone);vg.add(list(range(len(obj.data.vertices))),1,'REPLACE')
 mod=obj.modifiers.new('Rig','ARMATURE');mod.object=arm;obj.parent=arm;parts.append(obj);return obj

def uv(name,pos,scale,material,bone='body',rot=None):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=32,ring_count=20,location=pos)
 o=bpy.context.object;o.name=name;o.scale=scale
 if rot:o.rotation_euler=rot
 bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 for f in o.data.polygons:f.use_smooth=True
 o.data.materials.append(material);return bind(o,bone)

def line(name,coords,radius,material,bone='head',radii=None):
 c=bpy.data.curves.new(name,'CURVE');c.dimensions='3D';c.bevel_depth=radius;c.bevel_resolution=3
 sp=c.splines.new('BEZIER');sp.bezier_points.add(len(coords)-1)
 for i,(p,co) in enumerate(zip(sp.bezier_points,coords)):
  p.co=co;p.handle_left_type='AUTO';p.handle_right_type='AUTO'
  if radii:p.radius=radii[i]
 o=bpy.data.objects.new(name,c);bpy.context.collection.objects.link(o);o.data.materials.append(material)
 bpy.context.view_layer.objects.active=o;o.select_set(True);bpy.ops.object.convert(target='MESH');o=bpy.context.object;o.select_set(False)
 return bind(o,bone)

# Three-head-tall proportions, a relaxed white shirt and navy trousers.
uv('T-shirt',(0,0,1.19),(.31,.19,.36),white)
uv('Hem',(0,0,.94),(.29,.185,.10),white)
uv('Neck',(0,0,1.52),(.105,.10,.13),skin,'head')
uv('Head',(0,-.015,1.99),(.425,.337,.465),skin,'head')
# The head mesh provides a continuous chin surface.
for side,sgn in [('L',-1),('R',1)]:
 uv('Ear.'+side,(sgn*.412,-.005,1.98),(.077,.062,.12),skin,'head')
 uv('Inner ear.'+side,(sgn*.442,-.057,1.98),(.028,.018,.062),blush,'head')
 uv('Eye white.'+side,(sgn*.15,-.321,2.035),(.083,.031,.073),eye_white,'head')
 uv('Iris.'+side,(sgn*.15,-.349,2.033),(.042,.016,.052),eye,'head')
 uv('Eye glint.'+side,(sgn*.15-.013,-.364,2.054),(.013,.006,.016),eye_white,'head')
 line('Brow.'+side,[(sgn*.085,-.339,2.16),(sgn*.15,-.351,2.18),(sgn*.222,-.317,2.16)],.016,hair)
 uv('Cheek.'+side,(sgn*.26,-.286,1.91),(.047,.009,.023),blush,'head')
 uv('Sleeve.'+side,(sgn*.31,0,1.37),(.115,.14,.13),white,'upper_arm.'+side)
 uv('Upper arm.'+side,(sgn*.394,-.006,1.235),(.079,.078,.17),skin,'upper_arm.'+side,rot=(0,-sgn*.32,0))
 uv('Forearm.'+side,(sgn*.458,-.035,1.043),(.068,.067,.13),skin,'forearm.'+side)
 uv('Hand.'+side,(sgn*.475,-.044,.922),(.074,.052,.092),skin,'forearm.'+side)
 uv('Thumb.'+side,(sgn*.428,-.071,.946),(.031,.034,.047),skin,'forearm.'+side)
 uv('Thigh.'+side,(sgn*.155,0,.725),(.121,.135,.24),navy,'thigh.'+side)
 uv('Shin.'+side,(sgn*.16,0,.355),(.113,.125,.235),navy,'shin.'+side)
 uv('Sneaker.'+side,(sgn*.16,-.055,.105),(.123,.214,.095),shoes,'foot.'+side)
 line('Sole.'+side,[(sgn*.16-.10,-.16,.06),(sgn*.16,-.246,.055),(sgn*.16+.10,-.16,.06)],.013,white,'foot.'+side)
 for z in [.11,.14]:line('Laces',[(sgn*.16-.045,-.218,z),(sgn*.16+.045,-.218,z)],.005,white,'foot.'+side)
uv('Nose',(0,-.355,1.969),(.052,.058,.054),skin,'head')
line('Friendly smile',[(-.101,-.315,1.864),(0,-.349,1.836),(.101,-.315,1.864)],.010,mouth)
# A layered swept hairstyle rather than a featureless sphere.
verts=[];faces=[];rings=16;slices=48
for j in range(rings+1):
 for i in range(slices):
  phi=2*math.pi*i/slices
  front=max(0,-math.sin(phi)); theta=(j/rings)*(1.76-.57*front)
  verts.append((.449*math.sin(theta)*math.cos(phi),.365*math.sin(theta)*math.sin(phi)+.01,2.025+.49*math.cos(theta)))
for j in range(rings):
 for i in range(slices):
  a=j*slices+i;b=j*slices+(i+1)%slices;faces.append((a,b,b+slices,a+slices))
mesh=bpy.data.meshes.new('Hair cap');mesh.from_pydata(verts,[],faces);mesh.update();o=bpy.data.objects.new('Hair cap',mesh);bpy.context.collection.objects.link(o);o.data.materials.append(hair)
for f in mesh.polygons:f.use_smooth=True
bind(o,'head')
locks=[
 [(-.24,-.21,2.35),(-.33,-.30,2.30),(-.36,-.32,2.16),(-.31,-.31,2.12)],
 [(-.15,-.25,2.42),(-.29,-.32,2.35),(-.33,-.35,2.22)],
 [(-.03,-.22,2.45),(-.16,-.34,2.39),(-.24,-.36,2.28)],
 [(.01,-.27,2.43),(.16,-.34,2.39),(.29,-.33,2.27),(.34,-.29,2.14)],
 [(.06,-.16,2.48),(.25,-.25,2.43),(.37,-.24,2.32)],
 [(.15,-.04,2.48),(.36,-.12,2.39),(.43,-.07,2.25)],
 [(-.25,.03,2.46),(-.40,-.06,2.36),(-.45,-.04,2.16)],
]
for i,points in enumerate(locks):
 line('Swept hair %02d'%i,points,.065 if i%2 else .075,hair,'head',[.7]+[1]*(len(points)-2)+[.04])
 line('Hair strand %02d'%i,[(x,y-.047,z+.025) for x,y,z in points],.0055,hairlight,'head',[.2]+[1]*(len(points)-2)+[.01])
bpy.ops.mesh.primitive_torus_add(major_radius=.027,minor_radius=.007,major_segments=24,minor_segments=8,location=(.445,-.036,1.905),rotation=(math.pi/2,0,0))
o=bpy.context.object;o.name='Small gold earring';o.data.materials.append(gold);bind(o,'head')
# Orthographic lighting keeps the character readable at 100px on the page.
def area(name,pos,power,size):
 d=bpy.data.lights.new(name,'AREA');d.energy=power;d.shape='DISK';d.size=size;o=bpy.data.objects.new(name,d);bpy.context.collection.objects.link(o);o.location=pos;o.rotation_euler=(Vector((0,0,1.3))-o.location).to_track_quat('-Z','Y').to_euler()
area('Large key',(-3,-4,5),260,4);area('Fill',(3,-2,3),150,3);area('Hair rim',(1,3,4),280,3)
bpy.ops.object.camera_add(location=(3,-9,3.0));cam=bpy.context.object;cam.name='Sprite camera';cam.rotation_euler=(Vector((0,0,1.30))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=2.95;scene.camera=cam

def reset():
 for pb in arm.pose.bones:pb.rotation_mode='XYZ';pb.rotation_euler=(0,0,0);pb.location=(0,0,0)
 arm.location=(0,0,0);arm.rotation_euler=(0,0,0)

def world_turn(name, axis, angle):
 pb=arm.pose.bones[name];q=pb.bone.matrix_local.to_quaternion()
 pb.rotation_euler=(q.inverted() @ Quaternion(Vector(axis),angle) @ q).to_euler()

def pose(state,t):
 reset();phase=2*math.pi*t
 if state=='walk':
  arm.rotation_euler[2]=math.radians(53)
  arm.pose.bones['root'].location.z=.023*(1-math.cos(phase*2))
  for side,sgn in [('L',-1),('R',1)]:
   arm.pose.bones['thigh.'+side].rotation_euler.x=sgn*.53*math.sin(phase)
   arm.pose.bones['shin.'+side].rotation_euler.x=.38*max(0,-sgn*math.sin(phase))
   arm.pose.bones['upper_arm.'+side].rotation_euler.x=-sgn*.38*math.sin(phase)
   arm.pose.bones['forearm.'+side].rotation_euler.x=-.13
 elif state=='talk':
  arm.pose.bones['head'].rotation_euler.z=.025*math.sin(phase)
  arm.pose.bones['body'].rotation_euler.z=.015*math.sin(phase)
  world_turn('upper_arm.R',(0,1,0),-.65+.05*math.sin(phase))
  arm.pose.bones['forearm.R'].rotation_euler.x=-.92+.09*math.sin(phase)
 elif state=='wave':
  world_turn('upper_arm.R',(0,1,0),-2.05)
  arm.pose.bones['forearm.R'].rotation_euler.z=.30*math.sin(phase)
 else:arm.pose.bones['body'].scale=(1,1,1+.012*math.sin(phase))

# Export four named actions, with rigid skin weights for every mesh part.
for state,count in [('idle',12),('walk',12),('talk',12),('wave',12)]:
 arm.animation_data_create();arm.animation_data.action=None
 for i in range(count+1):
  frame=i+1;pose(state,i/count)
  arm.keyframe_insert('location',frame=frame,group='Root');arm.keyframe_insert('rotation_euler',frame=frame,group='Root')
  for pb in arm.pose.bones:
   pb.keyframe_insert('rotation_euler',frame=frame,group=pb.name);pb.keyframe_insert('location',frame=frame,group=pb.name);pb.keyframe_insert('scale',frame=frame,group=pb.name)
 arm.animation_data.action.name=state.title()
 track=arm.animation_data.nla_tracks.new();track.name=state.title();track.strips.new(state.title(),1,arm.animation_data.action);track.mute=True
 arm.animation_data.action=None
reset()
for pb in arm.pose.bones:pb.scale=(1,1,1)
bpy.ops.object.select_all(action='DESELECT');arm.select_set(True)
for o in parts:o.select_set(True)
bpy.context.view_layer.objects.active=arm
bpy.ops.export_scene.gltf(filepath=str(OUT/'president-walker.glb'),use_selection=True,export_animations=True,export_animation_mode='ACTIONS',export_materials='EXPORT')
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'president-walker.blend'))
if MODE=='preview':
 pose('talk',.1);scene.render.resolution_x=512;scene.render.resolution_y=768;scene.render.filepath=str(OUT/'preview.png');bpy.ops.render.render(write_still=True)
else:
 metadata={'width':256,'height':384,'fps':12,'states':{}}
 for state,count in [('idle',6),('walk',12),('talk',8),('wave',8)]:
  metadata['states'][state]={'frames':count}
  for i in range(count):
   pose(state,i/count);scene.render.filepath=str(FRAMES/(state+'-%02d.png'%i));bpy.ops.render.render(write_still=True)
 (OUT/'animation.json').write_text(json.dumps(metadata,indent=2))
print('PRESIDENT_ASSETS_READY',OUT)
