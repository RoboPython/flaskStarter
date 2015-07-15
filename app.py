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
app.debug = True



@app.route('/')
def index():
    return render_template('index.html', name=random.randint(1,1000))

@app.route('/tom')
def jsteaching():
    return render_template('jsteaching.html', name=random.randint(1,1000))


#ansible -i inventory/cottage-servers zz -m ntdr_get_version.py -a path=/var/www -vvv
@app.route('/getVersion', methods=['GET'])
def getVersion():
    os.chdir(PATH_TO_ANSIBLE)
    version_command =['ansible', '-i', 'inventory/cottage-servers',request.args['code'],  '-m', 'ntdr_get_version.py', '-a', 'path=/var/www/testing']
    version_info = subprocess.check_output(version_command)
    version_info = re.split('\n\s*\n', version_info)  

    tempArray = []
    for element in version_info:
        element =  element.replace(request.args['code']+'_test | success >>','')
        element =  element.replace(request.args['code']+'_live | success >>','')
        tempArray.append(element)
    
    version_info = tempArray


    versionData = '{"versionData":{ "test":' +version_info[0]+', "live":'+version_info[1]+ '}}'

    return versionData




if __name__ == '__main__':
    app.run()
