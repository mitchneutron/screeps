export class CreepActionManager {
    //todo vary actions based on type
    public static assignAction(creep: Creep) {
        creep.memory.target = undefined
        if (creep.store.getUsedCapacity() == 0) {
            creep.memory.action = CreepAction.Harvest
            const sources = creep.room.find(FIND_SOURCES_ACTIVE);
            if (sources.length == 0) {
                creep.say("I can't find a source with energy :(")
                return;
            }
            creep.say("Harvesting :)")
            creep.memory.target = sources[0].id
        }
        let constructionSites = creep.room.find(FIND_MY_CONSTRUCTION_SITES)
        if (constructionSites.length > 0) {
            let site = constructionSites[0]
            creep.memory.action = CreepAction.Build
            creep.memory.target = site.id
            creep.say("Building " + site.structureType)
            return;
        }
        let storageSites = creep.room.find(FIND_MY_STRUCTURES, {
            filter: this.isAvailableStorageStructure
        })
        if (storageSites.length > 0) {
            let site = storageSites[0]
            creep.memory.action = CreepAction.Store
            creep.memory.target = site.id
            creep.say("Filling storages!")
            return;
        }

        let controller = creep.room.controller
        if (controller) {
            creep.memory.action = CreepAction.Upgrade
            creep.memory.target = controller?.id
            creep.say("upgrading controller")
            return;
        }
        creep.say("I can't find anything to do.")
    }

    //todo actions should probably be different for every creep
    public static performAction(creep: Creep) {
        if (!creep.memory.action || !creep.memory.target) this.assignAction(creep)
        let id = creep.memory.target!
        let target = Game.getObjectById(id)
        switch (creep.memory.action) {
            case CreepAction.Build:
                if(this.performNewActionIfEmpty(creep)) return;
                if (creep.build(target) === ERR_NOT_IN_RANGE) {
                    this.moveCreep(creep, target)
                }
                break;
            case CreepAction.Harvest:
                if(this.performNewActionIfFull(creep)) return
                if(creep.harvest(target) === ERR_NOT_IN_RANGE) {
                    this.moveCreep(creep, target)
                }
                break;
            case CreepAction.Store:
                if(this.performNewActionIfEmpty(creep)) return;
                if(creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    this.moveCreep(creep, target)
                }
                break;
            case CreepAction.Upgrade:
                if(this.performNewActionIfEmpty(creep)) return;
                if(creep.upgradeController(target) === ERR_NOT_IN_RANGE) {
                    this.moveCreep(creep, target)
                }
        }
    }

    public static performNewActionIfEmpty(creep: Creep) : boolean {
        if(creep.store.getUsedCapacity() == 0) {
            creep.memory.action = undefined
            this.performAction(creep)
            return true
        }
        return false
    }

    public static performNewActionIfFull(creep: Creep) : boolean {
        if(creep.store.getFreeCapacity() == 0) {
            creep.memory.action = undefined
            this.performAction(creep)
            return true
        }
        return false
    }

    public static isAvailableStorageStructure(structure: Structure) {
        return (structure.structureType === STRUCTURE_EXTENSION ||
            structure.structureType === STRUCTURE_SPAWN ||
            structure.structureType === STRUCTURE_TOWER ||
            structure.structureType === STRUCTURE_STORAGE) &&
            (structure as StructureStorage).store.getFreeCapacity(RESOURCE_ENERGY) > 0;
    }

    private static moveCreep(creep: Creep, target: RoomPosition) : CreepMoveReturnCode | ERR_NO_PATH | ERR_INVALID_TARGET | ERR_NOT_FOUND {
        return creep.moveTo(target, {
            reusePath: 8, visualizePathStyle: {
                fill: 'transparent',
                stroke: '#fff',
                lineStyle: 'dashed',
                strokeWidth: .15,
                opacity: .1
            }
        })
    }
}