import flask
from flask import Flask
from flask import render_template
from flask import request
from flask import Response

from flask.ext.triangle import Triangle
from flask.ext.scss import Scss
from tachyon import bridge

import subprocess
import re
import json
import random
import os

app = Flask(__name__)
app.debug = True

app.debug = True

Triangle(app)
scss = Scss(app, static_dir='static/dep/styles', asset_dir='assets');

config = open('config/config.json','r')
config = json.loads(config.read())

PATH_TO_ANSIBLE = config['path_to_ansible']
PATH_PYTHON_APP = config['path_python_app']
MYSQL_ROOT_PW = config['mysql_root_pw']
PATH_TO_CACHE = config['path_python_app'] + 'cache/'
LIST_OF_SERVERS = config['list_of_servers']



playbooks = None
with open('config/playbooks.json', 'r') as playbooks_file:
    try:
        playbooks_raw = playbooks_file.read()
        playbooks = json.loads(playbooks_raw)
    except Exception as e:
        print('Could not load playbooks.json:', str(e))



@app.route('/')
def redesign():
    f = open(PATH_TO_CACHE+'filetree.cache','r')
    filetree_cache = f.read().strip()
    f.close()
    f2 = open (PATH_PYTHON_APP +'config/playbooks.json')
    playbook_json = f2.read().strip()
    f2.close()
    return render_template('index.html', data = {"filetree_cache":filetree_cache,"playbook_json":playbook_json})



@app.route('/playbooks.json')
def get_playbooks():
    playbooks_raw = json.dumps(playbooks)
    return Response(response=playbooks_raw, status=200, mimetype="application/json")



@app.route('/run_playbook', methods=['POST'])
def call_run_playbook():
    shortname = None
    print request.form
    print request.args
    if "shortname" in request.form:
        shortname = request.form["shortname"]
    else:
        return flask.jsonify(error="'shortname' parameter was missing"),400
    playbook = None
    for playbookCandidate in playbooks["playbooks"]:
        if playbookCandidate['shortname'] == shortname:
            playbook = playbookCandidate
    if playbook == None:
        return flask.jsonify(error="'shortname' value '" + shortname + "' does not exist")
    extra_vars = {}
    for field in playbook['fields']:
        if not field['name'] in request.form:
            if field['required']:
                return flask.jsonify(error="Field '" + field['name'] + "' is required")
            else:
                # TODO: implement default values
                continue
        else:
            value = request.form[field['name']]
            returnTypeCaster = None
            if field['returnType'] == 'string':
                returnTypeCaster = str
            elif field['returnType'] == 'boolean':
                returnTypeCaster = bool
            elif field['returnType'] == 'integer':
                returnTypeCaster = int
            try:
                castValue = returnTypeCaster(value)
            except Exception as e:
                return flask.jsonify(error="Field '" + field['name'] + "' could not be cast: " + str(e))
            if castValue != False:
                extra_vars[field['name']] = castValue
    
    for configObj in playbook['configNodes']:
        extra_vars[configObj["argName"]] = config[configObj['node']]

    print(json.dumps(extra_vars))

    playbook_path = PATH_TO_ANSIBLE + '/' + playbook['yaml']
    inventory_path = PATH_TO_ANSIBLE + '/inventory'

    if "code" in request.form:
        code = request.form["code"]
    else:
        return flask.jsonify(error="'code' parameter was missing")

    if "serverType" in request.form:
        server_type = request.form["serverType"]
    else:
        return flask.jsonify(error=" 'serverType' parameter was missing")

    if server_type  != 'All':
        limit = code +'_'+ server_type
    else:
        return flask.jsonify(error=" You cannot do operations on multiple servers at once")

    if request.headers.get('accept') == 'text/event-stream':
        def events():
            for callback_json in bridge.run_playbook_yield_events(playbook_path, inventory_path, limit, extra_vars):
                yield callback_json
        return Response(events(), content_type='text/event-stream')
    else:
        return '\n Error: request header is not "text/event-stream" \n'

#ansible -i inventory/cottage-servers zz -m ntdr_get_filetree.py -a path=/var/www
@app.route('/getFiletree', methods=['GET'])
def getFiletree():
    server_codes = config['list_of_servers']
    returnObj = {}
    for code in server_codes:
        print 'we are doing stuff honest'
        os.chdir(PATH_TO_ANSIBLE)
        filetree_command = ['ansible', '-i', 'inventory/cottage-servers', code, '-m', 'ntdr_get_filetree.py', '-a', 'path=/var/www']
        filetree = subprocess.check_output(filetree_command)
        filetree = task_parser(filetree,code)

        tasks = [
            {
                'name': 'Get file Tree from /var/www on the '+ code +' server group',
                'success': True,
                'errorMessage': None
            }
        ]

        filetree_data = {
            "data":{
                "test": json.loads(filetree[0])['stat']['files'],
                "live": json.loads(filetree[1])['stat']['files']
            },
            "meta":{
                "tasks": tasks
            },
            "code": code
        }

        returnObj[code] = filetree_data

    returnObj = json.dumps(returnObj, separators =(',',':'))


    f = open(PATH_PYTHON_APP+'filetree.txt','w')
    f.write(returnObj)
    f.close()
    return returnObj


# def run_playbook(playbook_path, inventory_path, event_callback=None):
'''
ansible-playbook pull-full-copy.yml \
          -i inventory/cottage-servers \
            --limit zz_test \
              --extra-vars="target=/var/www/zz_0.0"
'''

@app.route('/localCopy',methods=['GET'])
def localCopy():
    playbook_path = PATH_TO_ANSIBLE + '/pull-full-copy.yml'
    inventory_path = PATH_TO_ANSIBLE + '/inventory'

    if request.args['serverType'] != 'All':
        limit = request.args['code'] +'_'+request.args['serverType']
    else:
        return "Error: cannot pull local copy of more than one server at a time"

    extra_vars = { 'mysql_root_pw': MYSQL_ROOT_PW }

    if request.headers.get('accept') == 'text/event-stream':
        def events():
            for callback_json in bridge.run_playbook_yield_events(playbook_path, inventory_path, limit, extra_vars):
                yield callback_json
        return Response(events(), content_type='text/event-stream')
    else:
        return 'Error: request header is not "text/event-stream"'




if __name__ == '__main__':
    app.run('127.0.0.1', 5000,threaded=True)
