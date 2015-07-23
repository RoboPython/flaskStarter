from flask import Flask
from flask import render_template
from flask import request
from flask.ext.triangle import Triangle

import re
import json
import subprocess
import random
import os
import neonAnsible

app = Flask(__name__)
Triangle(app)


config = open('pythonConfig.txt','r')
config = json.loads(config.read())

PATH_TO_ANSIBLE = config['path_to_ansible']    
PATH_PYTHON_APP = config['path_python_app']

app.debug = True



def task_parser(string_value,brandcode): 
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
def redesign():
    f = open('filetree.txt','r')
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






'''
ansible-playbook pull-full-copy.yml \
          -i inventory/cottage-servers \
            --limit zz_test \
              --extra-vars="target=/var/www/zz_0.0"
'''

@app.route('/localCopy',methods=['GET'])
def localCopy():
    print 'doing my thing'

    extra_vars={'source':'/var/www' + request.args['source'],'local':request.args['local'],'mysql_root_pw':'cuffhattieslipper'}
    if request.args['withdb'] == 'true':
        extra_vars['withdb'] = 'true'
        print 'withdb was true'


    results =  neonAnsible.Playbook(folder_path='/home/vagrant/ansible/ntdr-pas/playbooks',
                   playbook='pull-full-copy.yml',
                   limit = request.args['code']+'_'+request.args['serverType'],
                   host_list='cottage-servers',
                   extra_vars= extra_vars)

    return json.dumps(results)
    


if __name__ == '__main__':
    app.run()
