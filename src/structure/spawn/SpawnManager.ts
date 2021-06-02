export class SpawnManager {
    public static run(spawn: StructureSpawn) {
        if (spawn.memory.isInitialized !== true) this.initSpawn(spawn)
        if (spawn.memory.deadCreepsToSpawn.length > 0 && this.spawnDeadCreep(spawn) === OK)
            return

        if (spawn.memory.basicWorkersRequired > 0) {
            let creepName = "BasicWorker_" + spawn.name + "_" + spawn.memory.basicWorkersRequired
            if (spawn.spawnCreep([WORK, CARRY, MOVE], creepName, {
                memory: this.createCreepMemory("basicWorker", spawn.id, creepName)
            }) === OK) {
                spawn.memory.basicWorkersRequired--
            }
        }
    }

    private static createCreepMemory(type: string, spawnId: Id<StructureSpawn>, name: string): CreepMemory {
        return {
            type: type,
            spawn: spawnId,
            name: name
        }
    }

    private static initSpawn (spawn: StructureSpawn) {
        let sources = spawn.room.find(FIND_SOURCES);
        spawn.memory.basicWorkersRequired = 3
        spawn.memory.advancedWorkersRequired = sources.length * 2;
        spawn.memory.deadCreepsToSpawn = []
        spawn.memory.isInitialized = true
    };

    private static spawnDeadCreep = function (spawn: StructureSpawn) {
        let creepMemory = spawn.memory.deadCreepsToSpawn[0];
        let body : BodyPartConstant[] = bodyMap[creepMemory.type]
        let spawnResult = spawn.spawnCreep(body, creepMemory.name, {memory: creepMemory});
        if (spawnResult === OK) {
            spawn.memory.deadCreepsToSpawn.splice(0, 1)
            console.log(spawn.name + ": spawning dead creep.")
        }
        return spawnResult
    };
}

const bodyMap: { [name: string]: BodyPartConstant[]; } = {
    basicWorker: [WORK, CARRY, MOVE]
};
