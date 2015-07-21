from flask import Flask
from flask import render_template
from flask import request
from flask.ext.triangle import Triangle

import json
import subprocess
import random
import os
import re


from ansible.playbook import PlayBook
from ansible.inventory import Inventory
from ansible import callbacks
from ansible import utils

app = Flask(__name__)
Triangle(app)


config = open('pythonConfig.txt','r')
config = json.loads(config.read())

PATH_TO_ANSIBLE = config['path_to_ansible']    
PATH_PYTHON_APP = config['path_python_app']
app.debug = True



utils.VERBOSITY  = 0
playbook_cb = callbacks.PlaybookCallbacks(verbose=utils.VERBOSITY)
stats = callbacks.AggregateStats()
runner_cb = callbacks.PlaybookRunnerCallbacks(stats, verbose=utils.VERBOSITY)






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
def redesign():
    f = open('filetree.txt','r')
    filetree_cache = f.read()
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






'''
ansible-playbook pull-full-copy.yml \
          -i inventory/cottage-servers \
            --limit zz_test \
              --extra-vars="target=/var/www/zz_0.0"
'''

@app.route('/localCopy',methods=['GET'])
def localCopy():
    pb =PlayBook(
        playbook='/home/vagrant/ansible/ntdr-pas/playbooks/pull-full-copy.yml',
        host_list='/home/vagrant/ansible/ntdr-pas/playbooks/inventory/cottage-servers',
        callbacks=playbook_cb,
        runner_callbacks=runner_cb,
        stats=stats,
    )
    results =pb.run()
    print results
    return 'yeah you got to switchTestingLatest well done'



if __name__ == '__main__':
    app.run()
