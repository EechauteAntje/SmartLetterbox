from .Database import Database


class DataRepository:
    @staticmethod
    def json_or_formdata(request):
        if request.content_type == 'application/json':
            gegevens = request.get_json()
        else:
            gegevens = request.form.to_dict()
        return gegevens

    @staticmethod
    def read_device():
        sql = "SELECT * from SlimmeBrievenbus.Device"
        return Database.get_rows(sql)

    @staticmethod
    def read_history():
        sql = "SELECT * from SlimmeBrievenbus.History"
        return Database.get_rows(sql)

    @staticmethod
    def read_history_by_deviceID_today(id, actionID):
        sql = "SELECT * FROM SlimmeBrievenbus.History where DeviceID=%s and ActionID = %s and Date = curdate();"
        params = [id, actionID]
        return Database.get_rows(sql, params)

    @staticmethod
    def read_history_by_deviceID(id, actionID):
        sql = "SELECT * FROM SlimmeBrievenbus.History where DeviceID=%s and ActionID = %s;"
        params = [id, actionID]
        return Database.get_rows(sql, params)

    @staticmethod
    def read_history_where_Date_is_today_with_deviceid(DeviceID):
        sql = 'SELECT * FROM SlimmeBrievenbus.History where DeviceID = %s and Date = curdate();'
        params = [DeviceID]
        return Database.get_rows(sql, params)

    @staticmethod
    def read_history_where_Date_is_thisweek_with_deviceid(DeviceID):
        sql = 'SELECT * FROM SlimmeBrievenbus.History where DeviceID = %s and week(Date) = week(CURDATE());'
        params = [DeviceID]
        return Database.get_rows(sql, params)

    @staticmethod
    def read_history_where_Date_is_thismonth_with_deviceid(DeviceID):
        sql = 'SELECT * FROM SlimmeBrievenbus.History where DeviceID = %s and month(Date) = month(CURDATE());'
        params = [DeviceID]
        return Database.get_rows(sql, params)

    @staticmethod
    def read_history_for_warning():
        sql = 'select * from SlimmeBrievenbus.History where ((DeviceID = 1 and ActionID = 1) or (DeviceID = 2 and ActionID = 5)) and IsDelivered = 0 and Date = curdate();'
        return Database.get_rows(sql)

    @staticmethod
    def read_last_weight():
        sql = 'SELECT Value FROM SlimmeBrievenbus.History where DeviceID = 3 order by HistoryID desc limit 1 '
        return Database.get_one_row(sql)

    @staticmethod
    def read_total(DeviceID, ActionID):
        sql = 'select count(HistoryID) as `Total` from SlimmeBrievenbus.History where DeviceID = %s and ActionID = %s;'
        params = [DeviceID, ActionID]
        return Database.get_one_row(sql, params)

    @staticmethod
    def insert_data_history(DeviceID, ActionID, Type, Date, Time, Value, IsDelivered):
        sql = "INSERT INTO `SlimmeBrievenbus`.`History` (`DeviceID`, `ActionID`, `Type`, `Date`, `Time`, `Value`,`IsDelivered`) VALUES (%s,%s, %s, %s, %s, %s, %s);"
        params = [DeviceID, ActionID, Type, Date, Time, Value, IsDelivered]
        return Database.execute_sql(sql, params)

    @staticmethod
    def update_is_delivered_accelero(isDelivered):
        sql = "Update SlimmeBrievenbus.History set IsDelivered=%s where DeviceID = 1 and ActionID = 1 ORDER BY HistoryID desc LIMIT 1;"
        params = [isDelivered]
        return Database.execute_sql(sql, params)

    @staticmethod
    def update_is_delivered_pir(isDelivered):
        sql = "Update SlimmeBrievenbus.History set IsDelivered=%s where DeviceID = 2 and ActionID = 5 ORDER BY HistoryID desc LIMIT 1;"
        params = [isDelivered]
        return Database.execute_sql(sql, params)

    @staticmethod
    def delete_packages(limit):
        sql = "Delete from SlimmeBrievenbus.History where Value > 0 and DeviceID=3 and ActionID = 3 order by HistoryId desc limit %s;"
        params = [limit]
        return Database.execute_sql(sql, params)
