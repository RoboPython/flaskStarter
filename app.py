import subprocess
from flask import Flask
from flask import render_template
#from flask.ext.socketio import SocketIO, emit
from flask import request

from flask.ext.triangle import Triangle
from flask.ext.scss import Scss
from tachyon import bridge

import re
import json
import random
import os
import old.oldapi


app = Flask(__name__)

Triangle(app)
#socketio = SocketIO(app)
scss = Scss(app, static_dir='static/dep/styles', asset_dir='assets');

config = open('pythonConfig.txt','r')
config = json.loads(config.read())

PATH_TO_ANSIBLE = config['path_to_ansible']
PATH_PYTHON_APP = config['path_python_app']
MYSQL_ROOT_PW = config['mysql_root_pw']
PATH_TO_CACHE = config['path_python_app'] + 'cache/'


app.debug = True

#Socketio test

#@socketio.on('connect', namespace='/serv')
#def handle_connection():
#    print 'connection initialized'


def task_parser(string_value, brandcode): 
    string_value = re.split('\n\s*\n', string_value)  
    
    tempArray = []
    for element in string_value:
        if not element.strip() == '':
            tempArray.append(element)

    string_value = tempArray
    tempArray = []
        

    for element in string_value:
        element =  element.replace(brandcode+'_test | success >>','')
        element =  element.replace(brandcode+'_live | success >>','')
        tempArray.append(element)
    
    return tempArray


#Routes

@app.route('/')
def redesign():
    f = open(PATH_TO_CACHE+'filetree.cache','r')
    filetree_cache = f.read().strip()
    f.close()
    return render_template('index.html', data = filetree_cache)

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
                    'name':'Get file Tree from /var/www on the '+ code +' server group',
                    'success':True,
                    'errorMessage':None
                }
        ]

        filetree_data = {
                            "data":{
                                    "test":json.loads(filetree[0])['stat']['files'],
                                    "live":json.loads(filetree[1])['stat']['files']
                            },
                            "meta":{
                                "tasks":tasks
                            },
                            "code":code
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
    def on_dict(returned_object):
        print returned_object
    bridge.run_playbook(PATH_TO_ANSIBLE + '/pull-full-copy.yml', PATH_TO_ANSIBLE + '/inventory',{'mysql_root_pw':MYSQL_ROOT_PW},"zz", on_dict)


    


if __name__ == '__main__':
#    socketio.run(app, '127.0.0.1', 5000)
    app.run('127.0.0.1', 5000)
    
