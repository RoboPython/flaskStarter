import json
import Queue
import threading

from ansible.playbook import PlayBook
from ansible.inventory import Inventory # TODO - check if needed
from ansible import callbacks
from ansible import utils # TODO - check if needed

from tachyon.emitter_callbacks import EmitterCallbacks

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


