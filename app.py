from flask import Flask
from flask import render_template
from flask import request
from flask.ext.triangle import Triangle

import json
import subprocess
import random
import os
import re

app = Flask(__name__)
Triangle(app)

PATH_TO_ANSIBLE = '/home/vagrant/ansible/ntdr-pas/playbooks/'    
PATH_PYTHON_APP = '/home/vagrant/flaskStarter/'
app.debug = True


def command_parser(string_value,brandcode): 
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




@app.route('/')
def index():
    return render_template('index.html')



@app.route('/redesign')
def redesign():
    f = open('filetree.txt','r')
    filetree_cache = f.read()
    f.close()
    return render_template('redesign.html', data = filetree_cache)





#ansible -i inventory/cottage-servers zz -m ntdr_get_filetree.py -a path=/var/www
@app.route('/getFiletree', methods=['GET'])
def getFiletree():

    server_codes = ['zz']
    returnObj = {}
    for code in server_codes:
        print 'we are doing stuff honest'
        os.chdir(PATH_TO_ANSIBLE)
        filetree_command = ['ansible', '-i', 'inventory/cottage-servers', code, '-m', 'ntdr_get_filetree.py', '-a', 'path=/var/www']
        filetree = subprocess.check_output(filetree_command)
        filetree = command_parser(filetree,code)
        
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
                            }
        }
        
        returnObj[code] = filetree_data

    returnObj = json.dumps(returnObj, separators =(',',':'))
         
    
    f = open(PATH_PYTHON_APP+'filetree.txt','w')
    f.write(returnObj)
    f.close()




    return returnObj



#ansible -i inventory/cottage-servers zz -m ntdr_get_version.py -a path=/var/www -vvv
@app.route('/getVersion', methods=['GET'])
def getVersion():
    os.chdir(PATH_TO_ANSIBLE)
    version_command =['ansible', '-i', 'inventory/cottage-servers',request.args['code'],  '-m', 'ntdr_get_version_improved.py', '-a', 'path='+request.args['path']]
    version_info = subprocess.check_output(version_command)

    
    version_info = re.split('\n\s*\n', version_info)  

    tempArray = []
    for element in version_info:
        element =  element.replace(request.args['code']+'_test | success >>','')
        element =  element.replace(request.args['code']+'_live | success >>','')
        tempArray.append(element)
    
    version_info = tempArray
   
    #as this task is not running from a playbook the fact it is made of one task is hardcoded.
    tasks = [
             {
                "name":"Get Versions available on servers",
                "success":True,
                "errorMessage":None
             }
    ]

    version_data = {
                        'versionData':{
                                'test':json.loads(version_info[0]),
                                'live':json.loads(version_info[1])
                        },
                        'meta':{
                            'tasks':tasks
                        }
                    }
    
    version_data = json.dumps(version_data, separators =(',',':'))
    
    return version_data




if __name__ == '__main__':
    app.run()
