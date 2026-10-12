// One combined lookup for generated lessons and hand-authored curriculum
// extensions.  Components should import these maps rather than the base files.
import { BEGINNER as BASE_BEGINNER } from './beginner.js'
import { EXTRAS as BASE_EXTRAS } from './extras.js'
import { PREREQUISITE_BEGINNER, PREREQUISITE_EXTRAS } from './prerequisites.js'
import { EXPANSION_BEGINNER, EXPANSION_EXTRAS } from './expansions/index.js'

export const BEGINNER = { ...BASE_BEGINNER, ...PREREQUISITE_BEGINNER, ...EXPANSION_BEGINNER }
export const EXTRAS = { ...BASE_EXTRAS, ...PREREQUISITE_EXTRAS, ...EXPANSION_EXTRAS }
