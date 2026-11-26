"""Preserve a supplied 2D president illustration in a textured, rigged 2.5D mesh.
blender -b --python scripts/build_president_cutout.py -- original|illustrated preview|render
No pixels of the input illustration are edited. The mesh carries its original UVs.
"""
import bpy,math,sys,json
from pathlib import Path
from mathutils import Vector,Quaternion
ROOT=Path(__file__).resolve().parents[1]
args=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
STYLE=args[0] if args else 'original';MODE=args[1] if len(args)>1 else 'preview'
SOURCE=ROOT/('assets/concierge/president-mini-v1.png' if STYLE=='original' else 'assets/concierge/president-walker/president-static-v2.png')
OUT=ROOT/'assets/concierge'/('president-cutout' if STYLE=='original' else 'president-cutout-illustrated')
OUT.mkdir(parents=True,exist_ok=True);FRAMES=OUT/'frames';FRAMES.mkdir(exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
sc=bpy.context.scene;sc.render.engine='CYCLES';sc.cycles.samples=64
sc.cycles.use_denoising=False;sc.render.film_transparent=True
sc.render.resolution_x=256;sc.render.resolution_y=384;sc.render.resolution_percentage=100
sc.render.image_settings.file_format='PNG';sc.render.image_settings.color_mode='RGBA';sc.render.fps=12
sc.view_settings.view_transform='Standard';sc.view_settings.look='None'
world=bpy.data.worlds.new('Transparent studio');sc.world=world;world.use_nodes=True;world.node_tree.nodes['Background'].inputs[1].default_value=0

def loc(u,v):return ((u-.5)*2,0,(1-v)*3)
if STYLE=='original':
 pts={'hip.L':(.50,.64),'knee.L':(.48,.795),'ankle.L':(.47,.92),'toe.L':(.40,.955),'hip.R':(.64,.64),'knee.R':(.66,.795),'ankle.R':(.70,.93),'toe.R':(.73,.965),'shoulder.L':(.43,.435),'elbow.L':(.33,.497),'wrist.L':(.16,.433),'shoulder.R':(.685,.432),'elbow.R':(.733,.533),'wrist.R':(.665,.606),'neck':(.54,.41),'head':(.55,.19),'pelvis':(.575,.64),'chest':(.55,.44)}
else:
 pts={'hip.L':(.43,.65),'knee.L':(.43,.785),'ankle.L':(.43,.90),'toe.L':(.39,.94),'hip.R':(.59,.65),'knee.R':(.59,.785),'ankle.R':(.59,.90),'toe.R':(.63,.94),'shoulder.L':(.375,.47),'elbow.L':(.33,.555),'wrist.L':(.30,.635),'shoulder.R':(.65,.47),'elbow.R':(.69,.555),'wrist.R':(.70,.635),'neck':(.51,.44),'head':(.51,.23),'pelvis':(.51,.65),'chest':(.51,.48)}
rig=bpy.data.armatures.new('Original illustration skeleton');arm=bpy.data.objects.new('President_2_5D',rig);bpy.context.collection.objects.link(arm)
bpy.context.view_layer.objects.active=arm;arm.select_set(True);bpy.ops.object.mode_set(mode='EDIT')
spec={'root':('pelvis','chest',None),'body':('pelvis','neck','root'),'head':('neck','head','body')}
for s in ['L','R']:
 spec['thigh.'+s]=('hip.'+s,'knee.'+s,'root');spec['shin.'+s]=('knee.'+s,'ankle.'+s,'thigh.'+s);spec['foot.'+s]=('ankle.'+s,'toe.'+s,'shin.'+s)
 spec['upper_arm.'+s]=('shoulder.'+s,'elbow.'+s,'body');spec['forearm.'+s]=('elbow.'+s,'wrist.'+s,'upper_arm.'+s)
for name,(a,b,parent) in spec.items():
 eb=rig.edit_bones.new(name);eb.head=loc(*pts[a]);eb.tail=loc(*pts[b])
 if parent:eb.parent=rig.edit_bones[parent]
bpy.ops.object.mode_set(mode='OBJECT');arm.select_set(False)
# A subdivided textured surface with a little physical depth. Front UVs never change.
NX,NY=64,96;verts=[];faces=[]
for j in range(NY+1):
 for i in range(NX+1):
  u,v=i/NX,j/NY;x,y,z=loc(u,v)
  # A shallow bowed surface supplies parallax without inventing new facial features.
  y=.028*((u-.53)**2)+.012*math.sin(math.pi*v)
  verts.append((x,y,z))
for j in range(NY):
 for i in range(NX):
  a=j*(NX+1)+i;faces.append((a,a+1,a+NX+2,a+NX+1))
mesh=bpy.data.meshes.new('Original image deformable surface');mesh.from_pydata(verts,[],faces);mesh.update()
obj=bpy.data.objects.new('Original artwork · unchanged UV',mesh);bpy.context.collection.objects.link(obj)
uv=mesh.uv_layers.new(name='Original illustration')
for poly in mesh.polygons:
 for li in poly.loop_indices:
  vi=mesh.loops[li].vertex_index;j,i=divmod(vi,NX+1);uv.data[li].uv=(i/NX,1-j/NY)
material=bpy.data.materials.new('Original artwork, transparent unlit');material.use_nodes=True
material.surface_render_method='DITHERED';material.use_transparency_overlap=False
nodes=material.node_tree.nodes;bs=nodes.get('Principled BSDF');tex=nodes.new('ShaderNodeTexImage');tex.image=bpy.data.images.load(str(SOURCE));tex.image.pack();tex.interpolation='Linear'
links=material.node_tree.links;links.new(tex.outputs['Color'],bs.inputs['Base Color']);links.new(tex.outputs['Color'],bs.inputs['Emission Color']);links.new(tex.outputs['Alpha'],bs.inputs['Alpha']);bs.inputs['Emission Strength'].default_value=1;bs.inputs['Roughness'].default_value=1
obj.data.materials.append(material)
for name in spec:obj.vertex_groups.new(name=name)
def blend(a,b,t):return {a:1-max(0,min(1,t)),b:max(0,min(1,t))}
def weights(u,v):
 if v<pts['neck'][1]-.025:return {'head':1}
 if v<pts['neck'][1]+.022:return blend('head','body',(v-(pts['neck'][1]-.025))/.047)
 # Match the silhouette of each source illustration rather than redrawing body parts.
 if STYLE=='original':
  left=(u<.39 and v<.55) or (u<.29 and v<.49)
  right=(u>.685 and v<.63)
 else:left=(u<.38 and v<.69);right=(u>.64 and v<.69)
 if left or right:
  s='L' if left else 'R';elbow=pts['elbow.'+s]
  if STYLE=='original' and s=='L':return blend('forearm.L','upper_arm.L',(u-.24)/.10)
  return blend('upper_arm.'+s,'forearm.'+s,(v-elbow[1]+.025)/.05)
 pelvis=pts['pelvis'][1]
 if v<pelvis-.018:return {'body':1}
 s='L' if u<pts['pelvis'][0] else 'R'
 if v<pelvis+.04:return blend('root','thigh.'+s,(v-pelvis+.018)/.058)
 knee=pts['knee.'+s][1];ankle=pts['ankle.'+s][1]
 if v<knee-.03:return {'thigh.'+s:1}
 if v<knee+.03:return blend('thigh.'+s,'shin.'+s,(v-knee+.03)/.06)
 if v<ankle-.02:return {'shin.'+s:1}
 return blend('shin.'+s,'foot.'+s,(v-ankle+.02)/.035)
for j in range(NY+1):
 for i in range(NX+1):
  vi=j*(NX+1)+i
  for name,w in weights(i/NX,j/NY).items():
   if w>0:obj.vertex_groups[name].add([vi],w,'REPLACE')
mod=obj.modifiers.new('Preserve artwork, animate body','ARMATURE');mod.object=arm;obj.parent=arm

def reset():
 arm.location=(0,0,0);arm.rotation_euler=(0,0,0)
 for pb in arm.pose.bones:pb.rotation_mode='XYZ';pb.rotation_euler=(0,0,0);pb.location=(0,0,0);pb.scale=(1,1,1)
def rotate(name,axis,angle):
 pb=arm.pose.bones[name];q=pb.bone.matrix_local.to_quaternion();pb.rotation_euler=(q.inverted() @ Quaternion(Vector(axis),angle) @ q).to_euler()
def pose(state,t):
 reset();phase=2*math.pi*t
 if state=='walk':
  arm.pose.bones['root'].location.z=.025*(1-math.cos(phase*2))
  arm.rotation_euler.z=.065*math.sin(phase)
  for side,sgn in [('L',-1),('R',1)]:
   rotate('thigh.'+side,(0,1,0),sgn*.17*math.sin(phase))
   rotate('shin.'+side,(0,1,0),.17*max(0,sgn*math.sin(phase)))
   rotate('upper_arm.'+side,(0,1,0),-sgn*.065*math.sin(phase))
 elif state in ['talk','wave']:
  rotate('head',(0,1,0),.022*math.sin(phase));rotate('body',(0,1,0),.009*math.sin(phase))
  rotate('forearm.L',(0,1,0),(.11 if state=='wave' else .045)*math.sin(phase))
 else:
  arm.pose.bones['body'].scale.y=1+.004*math.sin(phase)
  rotate('head',(0,1,0),.007*math.sin(phase))
bpy.ops.object.camera_add(location=(0,-7,1.5));cam=bpy.context.object;cam.rotation_euler=(Vector((0,0,1.5))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=3.3;sc.camera=cam
for state,count in [('idle',6),('walk',12),('talk',8),('wave',8)]:
 arm.animation_data_create();arm.animation_data.action=None
 for i in range(count+1):
  pose(state,i/count)
  arm.keyframe_insert('rotation_euler',frame=i+1);arm.keyframe_insert('location',frame=i+1)
  for pb in arm.pose.bones:
   for path in ['rotation_euler','location','scale']:pb.keyframe_insert(path,frame=i+1,group=pb.name)
 arm.animation_data.action.name=state.title()
 track=arm.animation_data.nla_tracks.new();track.name=state.title();track.strips.new(state.title(),1,arm.animation_data.action);track.mute=True;arm.animation_data.action=None
reset();bpy.ops.object.select_all(action='DESELECT');arm.select_set(True);obj.select_set(True);bpy.context.view_layer.objects.active=arm
bpy.ops.export_scene.gltf(filepath=str(OUT/'president-cutout.glb'),use_selection=True,export_animations=True,export_animation_mode='ACTIONS')
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'president-cutout.blend'))
meta={'width':256,'height':384,'fps':12,'source':str(SOURCE.relative_to(ROOT)),'technique':'2.5D textured mesh; original pixels and UVs preserved','states':{}}
if MODE=='preview':
 pose('idle',0);sc.render.resolution_x=512;sc.render.resolution_y=768;sc.render.filepath=str(OUT/'preview.png');bpy.ops.render.render(write_still=True)
else:
 for state,count in [('idle',6),('walk',12),('talk',8),('wave',8)]:
  meta['states'][state]={'frames':count}
  for n in range(count):
   pose(state,n/count);sc.render.filepath=str(FRAMES/f'{state}-{n:02d}.png');bpy.ops.render.render(write_still=True)
 (OUT/'animation.json').write_text(json.dumps(meta,ensure_ascii=False,indent=2))
print('ORIGINAL_ARTWORK_PRESERVED',OUT)
