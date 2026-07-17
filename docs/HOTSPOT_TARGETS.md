# Hotspot GLB Targets

Les hotspots principaux sont calcules depuis les objets reels du modele `public/models/quai/scene.glb`.

## Objets GLB identifies

- `pier`
- `boat back`
- `boat waves`
- `umbrella`
- `towel1`
- `towel2`
- `chair1`
- `chair2`
- `football`
- `ball`
- `ground`
- `bar`
- `water`
- `floor.001`

## Cibles utilisees

| Hotspot       | Objet(s) GLB                                       | Position calculee approximative | Sur la map |
| ------------- | -------------------------------------------------- | ------------------------------- | ---------- |
| `about`       | `chair1`, `chair2`, `umbrella`, `towel1`, `towel2` | `[-0.086, 1.801, -1.216]`       | oui        |
| `skills`      | `football`                                         | `[0.344, 1.321, -0.959]`        | oui        |
| `experiences` | `pier`                                             | `[-1.458, 1.507, -0.643]`       | oui        |
| `project`     | `boat back`                                        | `[1.554, 1.542, -1.486]`        | oui        |

## Cibles manquantes

- `cursus` : aucun mesh/groupe nomme `stairs`, `stair`, `escalier`, `escaliers` ou `steps` n'existe dans le GLB actuel. Le hotspot n'est donc pas affiche pour eviter un placement approximatif.
- `contact` : aucun mesh/groupe de contact fiable n'existe dans le GLB actuel. Le hotspot n'est donc pas affiche.

## A corriger dans Blender

Pour activer proprement les hotspots manquants, nommer les objets cibles dans Blender avant export :

- Escaliers : `stairs` ou `steps`
- Zone contact : `contact_card`, `business_card` ou `contact_table`
