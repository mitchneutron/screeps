import {ErrorMapper} from "./utils/ErrorMapper";
import {SpawnManager} from "./structure/spawn/SpawnManager"
import {CreepActionManager} from "./creep/CreepActionManager";
import {} from "./types"


// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
    // console.log(`Current game tick is ${Game.time}`);
    for (let spawnsKey in Game.spawns)
        SpawnManager.run(Game.spawns[spawnsKey])

    for (let name in Game.creeps) {
        let creep = Game.creeps[name];
        CreepActionManager.performAction(creep)
    }


    // Automatically delete memory of missing creeps
    handleMemory()
});

function handleMemory() {
    for (const name in Memory.creeps) {
        if (!Game.creeps[name]) {
            let creepMemory = Memory.creeps[name]
            Game.getObjectById(creepMemory.spawn)?.memory.deadCreepsToSpawn.push(creepMemory)

            console.log('Removing creep from memory: ' + Memory.creeps[name])
            delete Memory.creeps[name];
        }
    }
}