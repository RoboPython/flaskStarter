from ansible.playbook import PlayBook
from ansible.inventory import Inventory # TODO - check if needed
from ansible import callbacks
from ansible import utils # TODO - check if needed

from tachyon.emitter_callbacks import EmitterCallbacks

def run_playbook(playbook_path, inventory_path, event_callback=None):
    callbacks_object = EmitterCallbacks(None)
    stats = callbacks.AggregateStats()
    pb = PlayBook(
        playbook=playbook_path,
        host_list=inventory_path,
        callbacks=callbacks_object,
        runner_callbacks=callbacks_object,
        stats=stats
    )
    results = pb.run()
    callbacks_object.on_stats(pb.stats)
