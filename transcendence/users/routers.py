# users/routers.py

# router for tournament app database operations
class TournamentRouter:
    def db_for_read(self, model, **hints):
        if model._meta.app_label == 'tournament':
            return 'tournament'
        return 'default'

    def db_for_write(self, model, **hints):
        if model._meta.app_label == 'tournament':
            return 'tournament'
        return 'default'

    def allow_relation(self, obj1, obj2, **hints):
        if obj1._meta.app_label == 'tournament' or obj2._meta.app_label == 'tournament':
            return True
        return None

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        if app_label == 'tournament':
            return db == 'tournament'
        return db == 'default'