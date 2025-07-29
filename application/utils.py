# this file is used to store all auxilliary functions that does not havce any connetion to backend, Vue
from jinja2 import Template
from flask import render_template

def roles_list(roles):   # if we write ' "admin" in current_user.roles', it would return objects and we need string to compare 
    role_list= []
    for role in roles:
        role_list.append(role.name)
    return role_list 

def format_report(html_template, data): # takes a template file and data to fill in the template || data is in the form of dictionary
    with open(html_template) as file:
        template = Template(file.read())
    return template.render(data=data) # template filled with data
