'''
import os
import subprocess
import re

def playbook_parser(data):
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
                    tasks[server] = []
                returnObj['status'] = status
                tasks[server].append(returnObj)
    return tasks



def Playbook(folder_path=None,
             playbook=None,
             host_list=None,
             limit=None,
             extra_vars={}):
    
    os.chdir(folder_path)
   #ansible-playbook pull-full-copy.yml   -i inventory/cottage-servers   --limit zz_test   --extra-vars="source=/var/www/zz_0.0 local=/var/tmp mysql_root_pw=cuffhattieslipper"
   

    playbook_command = ['ansible-playbook', playbook, '-i', 'inventory/'+host_list,'--limit',limit, '--extra-vars="source=/var/www/zz_0.0 local=/var/tmp mysql_root_pw=cuffhattieslipper"']

    if (limit):
        basic_command=['--limit',limit]
        playbook_command.extend(basic_command)



    if bool(extra_vars):
        basic_command ='--extra-vars="'
        for key in extra_vars.keys():
            if extra_vars.keys().index(key) == 0:
                basic_command += key+'='+extra_vars[key]
            else:
                basic_command += ' '+key+'='+extra_vars[key]
        playbook_command.append(basic_command+'"')

    print playbook_command
    print "we're now running the command this may take forever"
    playbookResult  = subprocess.check_output(playbook_command)
    print "finished"
    print playbookResult
    return playbookResult


print Playbook(folder_path='/home/vagrant/ansible/ntdr-pas/playbooks',
               playbook='pull-full-copy.yml',
               limit = 'zz_test',
               host_list='cottage-servers',
               extra_vars={'target':'/var/www/zz_0.0','withdb':'true'})

'''
import subprocess
import os
print 'doing stuff now'


command_list = ['ansible-playbook','pull-full-copy.yml','-i', 'inventory/cottage-servers','--limit zz_test','--extra-vars="source=/var/www/zz_0.0 local=/var/tmp mysql_root_pw=cuffhattieslipper"']

os.chdir('/home/vagrant/ansible/ntdr-pas/playbooks')
result = subprocess.check_output(command_list)

print result
