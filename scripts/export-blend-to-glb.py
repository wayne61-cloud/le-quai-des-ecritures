import bpy
from pathlib import Path


output = Path("public/models/quai/scene.glb")
output.parent.mkdir(parents=True, exist_ok=True)

for obj in bpy.context.scene.objects:
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    try:
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    except Exception:
        pass
    obj.select_set(False)

bpy.ops.export_scene.gltf(
    filepath=str(output),
    export_format="GLB",
    use_selection=False,
    export_apply=True,
    export_materials="EXPORT",
    export_texcoords=True,
    export_normals=True,
    export_tangents=True,
    export_animations=True,
    export_image_format="AUTO",
    export_draco_mesh_compression_enable=True,
    export_draco_mesh_compression_level=6,
)
