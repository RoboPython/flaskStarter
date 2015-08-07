
import json
import Queue
import threading

from ansible.playbook import PlayBook
from ansible.runner import Runner
from ansible.inventory import Inventory # TODO - check if needed
from ansible import callbacks

from tachyon.emitter_callbacks import EmitterCallbacks

# TODO: consider separating wrapper functions and just documenting Ansible,
#       instead of maintaining a bridge where each new argument must be
#       reimplemented
# TODO: document functions, as they sure 'ain't documented by Ansible
# TODO: reduce code repetition

def run_playbook_call_callback(playbook_path, inventory_path, extra_vars, subset, event_callback):
    callbacks_object = EmitterCallbacks(event_callback)
    stats = callbacks.AggregateStats()
    pb = PlayBook(
        playbook         =   playbook_path,
        host_list        =   inventory_path,
        callbacks        =   callbacks_object,
        runner_callbacks =   callbacks_object,
        stats            =   stats,
        extra_vars       =   extra_vars,
        subset           =   subset
    )
    results = pb.run()
    # TODO: use the result of AggregateStats - must be converted to a dict object
    callbacks_object.on_complete()

def run_playbook_yield_events(playbook_path, inventory_path, subset, extra_vars):
    callback_queue = Queue.Queue()

    def on_dict(returned_object):
        callback_queue.put(returned_object)

    playbook_thread = threading.Thread(target=run_playbook_call_callback, args=(playbook_path, inventory_path, extra_vars, subset, on_dict))
    playbook_thread.start()

    for callback_json in iter(callback_queue.get,None):
        yield "data: %s\n\n" %json.dumps(callback_json)
        if callback_json['event'] == 'finished':
            break

def run_task_call_callback(module_name, module_path, inventory_path, subset, extra_vars, event_callback):
    callbacks_object = EmitterCallbacks(event_callback)
    runner = Runner(
        module_name     =   module_name,
        module_path     =   module_path,
        inventory       =   Inventory(inventory_path),
        module_args     =   extra_vars,
        callbacks       =   callbacks_object,
        subset          =   subset
    )
    results = runner.run()
    callbacks_object.on_complete()

def run_task_yield_events(module_name, module_path, inventory_path, subset, extra_vars):
    callback_queue = Queue.Queue()

    def on_task_dict(returned_object):
        callback_queue.put(returned_object)
    
    task_thread =threading.Thread(target=run_task_call_callback,args=(module_name, module_path, inventory_path,subset,extra_vars,on_task_dict))
    task_thread.start()
    
    for callback_json in iter(callback_queue.get,None):
        print callback_json
        yield callback_json
        print(callback_json)
        if callback_json['event'] == 'finished':
            break

