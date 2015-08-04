import re


f = open ('textdata.txt','r')
data = f.read()

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
 

print playbook_parser(data)

