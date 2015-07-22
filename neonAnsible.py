
import os
import subprocess
import re
import signal

def playbook_parser(data):
    try:
        data = re.split('\n\s*\n', data)
        del data[0] #removes PLAY ALL
        tasks ={}


        for task in data:
            returnObj = {}
            line_list = task.split('\n')
            
            title = line_list[0]
            server_responses = line_list[1:]  #removes empty tasks
            tempArray = []
            for response in server_responses:
                if response != '':
                    tempArray.append(response)
                
            server_responses = tempArray
            
            if title.replace('*','').strip()  != 'PLAY RECAP':
                stripped_title =title.replace('*','').replace('[','').replace(']','').split(':')
                if len(stripped_title) > 1:
                    returnObj['name'] = title.replace('*','').replace('[','').replace(']','').split(':')[1].split('|')[1].strip()
                else:
                    returnObj['name'] = 'Gathering Facts'


                
                for response in server_responses:
                    status = response.split(':')[0]
                    server = response.split(':')[1].replace('[','').replace(']','').split('->')[0].strip()
                    if server not in tasks:
                        tasks[server] = {'task':[],'name':server}
                    returnObj['status'] = status
                    tasks[server]['task'].append(returnObj)
        finalRet = {'tasks':tasks,'meta':{'success':True}}
    except:
        finalRet = {'tasks':{},'meta':{'success':False}}
            
    return finalRet


def Playbook(folder_path=None,
             playbook=None,
             host_list=None,
             limit=None,
             extra_vars={}):
    
    os.chdir(folder_path)

    #playbook_command = ['ansible-playbook pull-full-copy.yml -i inventory/cottage-servers  --limit zz_test --extra-vars="source=/var/www/zz_0.0 local=/var/tmp mysql_root_pw=cuffhattieslipper"']

    spacer = ' '
    playbook_command = ['ansible-playbook'+ spacer + playbook + spacer + '-i' + spacer + 'inventory/'+ host_list + spacer ]

    if (limit):
        playbook_command[0] += '--limit' + spacer + limit + spacer


    
    if bool(extra_vars):
        basic_command ='--extra-vars="'
        for key in extra_vars.keys():
            if extra_vars.keys().index(key) == 0:
                basic_command += key+'='+extra_vars[key]
            else:
                basic_command += ' '+key+'='+extra_vars[key]
        playbook_command[0] += basic_command+'"'
    
    
    playbookResult  = subprocess.check_output(playbook_command,shell=True)
    return playbook_parser(playbookResult)
    

if __name__ == "__main__":
    print Playbook(folder_path='/home/vagrant/ansible/ntdr-pas/playbooks',
                   playbook='pull-full-copy.yml',
                   limit = 'zz_test',
                   host_list='cottage-servers',
                   extra_vars={'source':'/var/www/zz_0.0','local':'/var/tmp','mysql_root_pw':'cuffhattieslipper'})

