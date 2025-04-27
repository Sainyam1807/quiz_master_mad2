# this file is used to store all auxilliary functions that does not havce any connetion to backend, Vue


def roles_list(roles):   # if we write ' "admin" in current_user.roles', it would return objects and we need string to compare 
    role_list= []
    for role in roles:
        role_list.append(role.name)
    return role_list 