import { db } from "../utils/db.server";
import {CreateGroupAndEnrollSelfResult, GroupMember, SavingGroup, User, UserWithGroup } from "../utils/types";


export class SavingGroupService{

    // create saving group
    create = async (data: SavingGroup): Promise <CreateGroupAndEnrollSelfResult> => {

        const {id, name, description, userId, thumbnail, publicId} = data;

        return await db.$transaction( async (tx) => {

            //create new group
            const newGroup = await tx.savingGroup.create({
                data: {
                    id,
                    name,
                    description,
                    userId,
                    thumbnail,
                    publicId
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            uniqueIdentity: true,
                            fullname: true,
                            address: true,
                            email: true,
                            phone: true,
                            role: true,
                            createdAt: true,
                            updatedAt: true
                        }
                    }
                }
            });

            // add self as a default member after group creation
            const newMember = await tx.groupMembers.create({
                data: {
                    userId: userId,
                    groupId: newGroup.id,
                    addedBy: userId
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            uniqueIdentity: true,
                            fullname: true,
                            address: true,
                            email: true,
                            phone: true,
                            role: true,
                            createdAt: true,
                            updatedAt: true
                        }
                    },
                    group: true,
                    addedByUser: {
                        select: {
                            id: true,
                            uniqueIdentity: true,
                            fullname: true,
                            address: true,
                            email: true,
                            phone: true,
                            role: true,
                            createdAt: true,
                            updatedAt: true
                        }
                    }
                }
            });

            return {newGroup, newMember};
        })
    }

    //find specific group
    findGroup = async (groupId: string): Promise <Partial<SavingGroup | null>> => {
        return await db.savingGroup.findFirst({
            where: {
                id: groupId
            },
            include: {
                contributions: {
                    include: {
                        user: true
                    }
                }
            }
        });
    }

    // check if user exist in a group
    findUserInGroup = async (userId: number, groupId: string): Promise <GroupMember | null> => {
        return await db.groupMembers.findFirst({
            where: {
                userId: userId,
                groupId: groupId
            }
        });
    }

    //add new member in a group
    enrollMember = async (userId: any, groupId: string, addedBy: number): Promise <GroupMember | null > => {

        return await db.$transaction( async (tx) => {
            return await tx.groupMembers.create({
                data: {
                    userId: userId,
                    groupId: groupId,
                    addedBy: addedBy
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            uniqueIdentity: true,
                            fullname: true,
                            address: true,
                            email: true,
                            phone: true,
                            role: true,
                            createdAt: true,
                            updatedAt: true
                        }
                    },
                    group: true,
                    addedByUser: {
                        select: {
                            id: true,
                            uniqueIdentity: true,
                            fullname: true,
                            address: true,
                            email: true,
                            phone: true,
                            role: true,
                            createdAt: true,
                            updatedAt: true
                        }
                    }
                }
            });
        })
    }

    //user enrolled group list
    userEnrolledGroups = async (userId: number): Promise <any | null> => {
        return await db.user.findUnique({
            where: {
                id: userId
            },
            include:{
                groups: {
                    include: {
                        group: {
                            include: {
                                contributions: {
                                    include: {
                                        user: true
                                    }
                                }
                            }
                        },
                    }
                },
                contributions: true
            }
        })
    }


    //find user in group
    userInGroupCheck = async (userId: number, groupId: string): Promise <SavingGroup | null> => {
        return await db.savingGroup.findFirst({
            where: {
                id: groupId,
                userId: userId
            }
        })
    }

    // list all members of a group
    findGroupMembers = async (groupId: string): Promise <GroupMember []> => {

        return await db.groupMembers.findMany({
            where: {
                groupId
            },
            include: {
                user: true,
            }
        })
    }


    //find members added by a user
    findUserAddedMembers = async (userId: number, groupId: string) => {
        return await db.groupMembers.findMany({
          where: {
            addedByUser: { id: userId },
            groupId
          },
          include: { 
            user: {
                select: {
                    id: true,
                    uniqueIdentity: true,
                    fullname: true,
                    address: true,
                    email: true,
                    phone: true,
                    role: true,
                    createdAt: true,
                    updatedAt: true
                }
            }
           },
        });
    }
}