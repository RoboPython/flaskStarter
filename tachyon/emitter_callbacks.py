class EmitterCallbacks:
    def __init__(self, emitter):
        self.emitter = emitter

    ##############
    ### Runner ###
    ##############
    def on_failed(self, host, res, ignore_errors=False):
        pass

    def on_ok(self, host, res):
        pass

    def on_skipped(self, host, item=None):
        pass

    def on_unreachable(self, host, res):
        pass

    def on_no_hosts(self):
        pass

    def on_async_poll(self, host, res, jid, clock):
        pass

    def on_async_ok(self, host, res, jid):
        pass

    def on_async_failed(self, host, res, jid):
        pass

    ################
    ### PlayBook ###
    ################
    def on_start(self):
        pass

    def on_notify(self, host, handler):
        pass

    def on_no_hosts_matched(self):
        pass

    def on_no_hosts_remaining(self):
        pass

    def on_task_start(self, name, is_conditional):
        pass

    def on_vars_prompt(self, varname, private=True, prompt=None, encrypt=None, confirm=False, salt_size=None, salt=None, default=None):
        pass

    def on_setup(self):
        pass

    def on_import_for_host(self, host, imported_file):
        pass

    def on_not_import_for_host(self, host, missing_file):
        pass

    def on_play_start(self, name):
        pass

    def on_stats(self, stats):
        pass
