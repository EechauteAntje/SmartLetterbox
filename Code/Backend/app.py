from logging import warn
from typing import List
from repositories.DataRepository import DataRepository
from flask import Flask, jsonify, request
from flask_socketio import SocketIO, emit, send
from flask_cors import CORS
import time
from RPi import GPIO
from helpers.klasseknop import Button
from helpers.Klasse_MPU import MPU
from helpers.KlasseLCD import LCD
import threading
import datetime
import json
import sys

# Code voor Flask

app = Flask(__name__)
app.config['SECRET_KEY'] = 'geheim!'
socketio = SocketIO(app, cors_allowed_origins="*",
                    logger=False, engineio_logger=False, ping_timeout=1)

CORS(app)

endpoint = '/api/v1'


# load_Cell

EMULATE_HX711 = False

if not EMULATE_HX711:
    import RPi.GPIO as GPIO
    from helpers.load_cell import HX711
else:
    from helpers.emulated_hx711 import HX711


# Code voor Hardware


GPIO.setwarnings(False)
GPIO.setmode(GPIO.BCM)

# pir sensor
pir_sensor = 17
GPIO.setup(pir_sensor, GPIO.IN, GPIO.PUD_UP)
vorige_waarde_PIR = 0

# accelero meter
MPU = MPU()
MPU.setup()
vorige_waarde_MPU = 0

# load cell


def cleanAndExit():
    print("Cleaning...")

    if not EMULATE_HX711:
        GPIO.cleanup()

    print("Bye!")
    sys.exit()


hx = HX711(6, 5)
hx.set_reading_format("MSB", "MSB")
hx.set_reference_unit(100)
hx.reset()
hx.tare()
print("Tare done! Add weight now...")
vorige_waarde_load_cell = ''

# magneet
magnet = 25
GPIO.setup(magnet, GPIO.OUT)
magnet_value = 0
GPIO.output(25, GPIO.HIGH)

# LCD
LCD = LCD()
LCD.init_LCD()
message = 'have a good day mailman'

# button
vorige_waarde_button = ''
button = 4
GPIO.setup(button, GPIO.IN, GPIO.PUD_UP)
button_value = ''

# Thread


def pir():
    global vorige_waarde_PIR
    while True:
        # print(GPIO.input(pir_sensor))
        waarde_pir = GPIO.input(pir_sensor)
        if waarde_pir != vorige_waarde_PIR:
            now = datetime.datetime.now()
            if waarde_pir == 1:
                DataRepository.insert_data_history(2, 5, 'sensor', now.strftime(
                    "%Y-%m-%d"), now.strftime("%H:%M:%S"), waarde_pir, 0)
                length_data = DataRepository.read_total(2, 5)['Total']
                socketio.emit('B2F_dataPir', {'Date': now.strftime(
                    "%Y-%m-%d"), 'Time':  now.strftime("%H:%M"), 'ActionID': 5, 'IsDelivered': 0, 'lengthData': length_data}, broadcast=True)

                if len(message) > 16:
                    # message1 = message[0:16]
                    # message2 = message[16:]
                    pos_space = message[0:16].rfind(" ")
                    first_line = message[0:pos_space]
                    print(first_line)
                    second_line = message[pos_space+1:]
                    print(second_line)
                    LCD.write_message(first_line)
                    LCD.send_instruction((0x80 | 0x40))
                    LCD.write_message(second_line)
                else:
                    LCD.write_message(message)
                time.sleep(15)

            if waarde_pir == 0:
                DataRepository.insert_data_history(2, 6, 'sensor', now.strftime(
                    "%Y-%m-%d"), now.strftime("%H:%M:%S"), waarde_pir, 0)

                LCD.send_instruction(0x01)

        vorige_waarde_PIR = waarde_pir
        # data_pir = DataRepository.read_history_by_deviceID_today(2, 5)
        # list = []
        # for Waarde in data_pir:
        #     DeviceID = Waarde['DeviceID']
        #     ActionID = Waarde['ActionID']
        #     Date = str(Waarde['Date'])
        #     Time = str(Waarde['Time'])
        #     loc = Time.rfind(':')
        #     Time = Time[:loc]
        #     isDelivered = Waarde['IsDelivered']
        #     list.append({'ActionID': ActionID, 'DeviceID': DeviceID,
        #                  'Date': Date, 'Time': Time, 'IsDelivered': isDelivered})
        # socketio.emit('B2F_dataPir',
        #               list, broadcast=True)

        time.sleep(1)


threading.Timer(1, pir).start()


def accelero():
    global vorige_waarde_MPU
    # global waardex
    while True:
        waardey = round(MPU.read_data_versnelling()[1], 1)
        # print(f'waarde accelero: {waardey}')
        if waardey != vorige_waarde_MPU:
            # socketio.emit('B2F_accelero', {'value': waardey}, broadcast=True)
            now = datetime.datetime.now()
            if waardey > 0.8:

                DataRepository.insert_data_history(1, 2, 'sensor', now.strftime(
                    "%Y-%m-%d"), now.strftime("%H:%M"), waardey, 0)

            if waardey <= 0.8:

                DataRepository.insert_data_history(1, 1, 'sensor', now.strftime(
                    "%Y-%m-%d"), now.strftime("%H:%M:%S"), waardey, 0)
                length_data = DataRepository.read_total(1, 1)['Total']
                socketio.emit('B2F_dataAccelero', {'Date': str(now.strftime(
                    "%Y-%m-%d")), 'Time':  str(now.strftime("%H:%M")), 'ActionID': 1, 'IsDelivered': 0, 'lengthData': length_data}, broadcast=True)

        vorige_waarde_MPU = waardey
        # data_accelero = DataRepository.read_history_by_deviceID_today(1, 1)
        # list = []
        # for Waarde in data_accelero:
        #     DeviceID = Waarde['DeviceID']
        #     ActionID = Waarde['ActionID']
        #     Date = str(Waarde['Date'])
        #     Time = str(Waarde['Time'])
        #     loc = Time.rfind(':')
        #     Time = Time[:loc]
        #     isDelivered = Waarde['IsDelivered']
        #     list.append({'ActionID': ActionID, 'DeviceID': DeviceID,
        #                  'Date': Date, 'Time': Time, 'IsDelivered': isDelivered})
        # socketio.emit('B2F_dataAccelero',
        #               list, broadcast=True)
        time.sleep(2)


threading.Timer(2, accelero).start()


def load_cell():
    global vorige_waarde_load_cell
    global magnet_value
    global button_value
    while True:
        # if magnet_value == 1:
        #     time.sleep(1)
        print(hx.get_weight(5))

        # if button_value == 1:
        #     hx.reset()
        #     hx.tare()
        #     break

        if button_value == 1:
            # print(f'magnet: {magnet_value}')
            val = int(10 * round(float(hx.get_weight(5))/10))
            exact = hx.get_weight(5)
            # list = []
            # list.append(val)
            # # print(list)
            # weigth = round(sum(list)/len(list))
            # if len(list) > 4:
            #     print(list)
            #     list = []
            # weigth = int(5 * round(float(val)/5))
            # print(weigt)
            if val > 0:
                # time.sleep(1)
                weight = int(10 * round(float(hx.get_weight(5))/10))

                if weight > 0:
                    print(weight)
                    if val != vorige_waarde_load_cell:
                        now = datetime.datetime.now()
                        # if weight > 1:
                        #     print(f'gewicht: {weight}')
                        #     DataRepository.insert_data_history(3, 3, 'sensor', now.strftime(
                        #         "%Y-%m-%d"), now.strftime("%H:%M:%S"), 1, 1)
                        #     DataRepository.update_is_delivered_accelero(1)
                        #     DataRepository.update_is_delivered_pir(1)

                        last_Weight = DataRepository.read_last_weight()
                        if weight > (last_Weight['Value'] + 10):
                            # time.sleep(1)
                            if weight > 1:
                                print(f'gewicht: {weight}')
                                DataRepository.insert_data_history(3, 3, 'sensor', now.strftime(
                                    "%Y-%m-%d"), now.strftime("%H:%M:%S"), weight, 1)
                                DataRepository.update_is_delivered_accelero(1)
                                DataRepository.update_is_delivered_pir(1)
                        vorige_waarde_load_cell = val

                        # if weight < vorige_waarde_load_cell:
                        #     DataRepository.insert_data_history(3, 4, 'sensor', now.strftime(
                        #         "%Y-%m-%d"), now.strftime("%H:%M:%S"), 0, 0)
                        #     DataRepository.delete_packages()
                        #     print('kleiner dan')
                        #     # weight = 0
                        #     hx.reset()
                        #     hx.tare()
                        #     val = vorige_waarde_load_cell

            if val < 1:
                # time.sleep(1)
                weight = int(10 * round(float(hx.get_weight(5))/10))
                print(weight)
                if val != vorige_waarde_load_cell:
                    now = datetime.datetime.now()
                    if weight < 1:
                        # print(f'gewicht: {weight}')
                        print(f'gewicht < 0: {weight}')
                        DataRepository.insert_data_history(3, 4, 'sensor', now.strftime(
                            "%Y-%m-%d"), now.strftime("%H:%M:%S"), 0, 0)
                        limit = len(
                            DataRepository.read_history_by_deviceID(3, 3))
                        DataRepository.delete_packages(limit)
                vorige_waarde_load_cell = val


            # if val < 0:
            #     hx.reset()
            #     hx.tare()
            #     print("Tare done! Add weight now...")

            if exact < -2:
                hx.reset()
                hx.tare()
                print("Tare done! Add weight now...")
            
            if exact > 4.9 and exact < 8:
                hx.reset()
                hx.tare()
                print("Tare done! Add weight now...")

            hx.power_down()
            hx.power_up()
            data_load = DataRepository.read_history_by_deviceID(3, 3)
            list_load = []
            for Waarde in data_load:
                HistoryID = Waarde['HistoryID']
                DeviceID = Waarde['DeviceID']
                ActionID = Waarde['ActionID']
                Type = Waarde['Type']
                Date = str(Waarde['Date'])
                Time = str(Waarde['Time'])
                loc = Time.rfind(':')
                Time = Time[:loc]
                Value = Waarde['Value']
                if ActionID == 3:
                    list_load.append({'HistoryID': HistoryID, 'ActionID': ActionID, 'DeviceID': DeviceID,
                                      'Type': Type, 'Date': Date, 'Time': Time, 'Value': Value})
            socketio.emit('B2F_weight', list_load, broadcast=True)
            # time.sleep(1)


threading.Timer(4, load_cell).start()




def warning():
    while True:
        data_warning = DataRepository.read_history_for_warning()
        list = []
        for Waarde in data_warning:
            HistoryID = Waarde['HistoryID']
            DeviceID = Waarde['DeviceID']
            ActionID = Waarde['ActionID']
            Type = Waarde['Type']
            Date = str(Waarde['Date'])
            Time = str(Waarde['Time'])
            Value = Waarde['Value']
            IsDelivered = Waarde['IsDelivered']
            list.append({'HistoryID': HistoryID, 'ActionID': ActionID, 'DeviceID': DeviceID,
                        'Type': Type, 'Date': Date, 'Time': Time, 'Value': Value, 'IsDelivered': IsDelivered})
        socketio.emit('B2F_warning', list, broadcast=True)
        time.sleep(1)


threading.Timer(2, warning).start()


@socketio.on('F2B_btn_letterbox')
def magnet(value):
    # print(value['value'])
    global magnet_value
    global button_value
    magnet_value = value['value']
    if magnet_value == 0:
        print('open')
        now = datetime.datetime.now()
        DataRepository.insert_data_history(4, 7, 'actuator', now.strftime(
            "%Y-%m-%d"), now.strftime("%H:%M:%S"), value['value'], 0)
        while magnet_value == 0:
            GPIO.output(25, GPIO.LOW)
            # time.sleep(1)
            if button_value == 0:
                print('close door')
                GPIO.output(25, GPIO.HIGH)
                magnet_value = 1
                break
    else:
        now = datetime.datetime.now()
        DataRepository.insert_data_history(4, 8, 'actuator', now.strftime(
            "%Y-%m-%d"), now.strftime("%H:%M:%S"), value['value'], 0)
        print('gesloten')
        while magnet_value == 1:
            GPIO.output(25, GPIO.HIGH)
            time.sleep(1)
            break


def message_lcd():
    global message
    socketio.emit('B2F_messageLCD', {'message': message}, broadcast=True)
    print('message')


threading.Timer(1, message_lcd).start()


def button():
    global vorige_waarde_button
    global magnet_value
    global button_value
    while True:
        button_data = GPIO.input(4)
        button_value = button_data
        if button_data != vorige_waarde_button:
            print(f'button: {button_data}')
            socketio.emit(
                'B2F_door', {"data": button_data, 'magnet': magnet_value})
        #     if button_data == 0:
        #         GPIO.output(25, GPIO.HIGH)
        vorige_waarde_button = button_data
        # time.sleep(1)


threading.Timer(1, button).start()


@socketio.on('F2B_message')
def lcd(text):
    global message
    print(text['text'])
    message = text['text']
    message_lcd()


@socketio.on('F2B_delete')
def delete_package(data):
    DataRepository.delete_packages(1)
    hx.reset()
    hx.tare()


@app.route(endpoint + '/dataAccelero/<id>', methods=['GET'])
def get_data_accelero(id):
    if request.method == 'GET':
        if id == 'today':
            data_accelero = DataRepository.read_history_where_Date_is_today_with_deviceid(
                1)
            list = []
            for Waarde in data_accelero:
                HistoryID = Waarde['HistoryID']
                DeviceID = Waarde['DeviceID']
                ActionID = Waarde['ActionID']
                Type = Waarde['Type']
                Date = str(Waarde['Date'])
                Time = str(Waarde['Time'])
                loc = Time.rfind(':')
                Time = Time[:loc]
                Value = Waarde['Value']
                IsDelivered = Waarde['IsDelivered']
                if ActionID == 1:
                    list.append({'HistoryID': HistoryID, 'ActionID': ActionID, 'DeviceID': DeviceID,
                                'Type': Type, 'Date': Date, 'Time': Time, 'Value': Value, 'IsDelivered': IsDelivered})
            return jsonify(list)
        if id == 'week':
            data_accelero = DataRepository.read_history_where_Date_is_thisweek_with_deviceid(
                1)
            list = []
            for Waarde in data_accelero:
                HistoryID = Waarde['HistoryID']
                DeviceID = Waarde['DeviceID']
                ActionID = Waarde['ActionID']
                Type = Waarde['Type']
                Date = str(Waarde['Date'])
                Time = str(Waarde['Time'])
                loc = Time.rfind(':')
                Time = Time[:loc]
                Value = Waarde['Value']
                IsDelivered = Waarde['IsDelivered']
                if ActionID == 1:
                    list.append({'HistoryID': HistoryID, 'ActionID': ActionID, 'DeviceID': DeviceID,
                                'Type': Type, 'Date': Date, 'Time': Time, 'Value': Value, 'IsDelivered': IsDelivered})
            return jsonify(list)

        if id == 'month':
            data_accelero = DataRepository.read_history_where_Date_is_thismonth_with_deviceid(
                1)
            list = []
            for Waarde in data_accelero:
                HistoryID = Waarde['HistoryID']
                DeviceID = Waarde['DeviceID']
                ActionID = Waarde['ActionID']
                Type = Waarde['Type']
                Date = str(Waarde['Date'])
                Time = str(Waarde['Time'])
                loc = Time.rfind(':')
                Time = Time[:loc]
                Value = Waarde['Value']
                IsDelivered = Waarde['IsDelivered']
                if ActionID == 1:
                    list.append({'HistoryID': HistoryID, 'ActionID': ActionID, 'DeviceID': DeviceID,
                                'Type': Type, 'Date': Date, 'Time': Time, 'Value': Value, 'IsDelivered': IsDelivered})
            return jsonify(list)


@app.route(endpoint + '/dataPir/<id>', methods=['GET'])
def get_data_Pir(id):
    if request.method == 'GET':
        if id == 'today':
            data_Pir = DataRepository.read_history_where_Date_is_today_with_deviceid(
                2)
            list_pir = []
            for Waarde in data_Pir:
                HistoryID = Waarde['HistoryID']
                DeviceID = Waarde['DeviceID']
                ActionID = Waarde['ActionID']
                Type = Waarde['Type']
                Date = str(Waarde['Date'])
                Time = str(Waarde['Time'])
                loc = Time.rfind(':')
                Time = Time[:loc]
                Value = Waarde['Value']
                IsDelivered = Waarde['IsDelivered']
                if ActionID == 5:
                    list_pir.append({'HistoryID': HistoryID, 'ActionID': ActionID, 'DeviceID': DeviceID,
                                    'Type': Type, 'Date': Date, 'Time': Time, 'Value': Value, 'IsDelivered': IsDelivered})
            return jsonify(list_pir)
        if id == 'week':
            data_Pir = DataRepository.read_history_where_Date_is_thisweek_with_deviceid(
                2)
            list_pir = []
            for Waarde in data_Pir:
                HistoryID = Waarde['HistoryID']
                DeviceID = Waarde['DeviceID']
                ActionID = Waarde['ActionID']
                Type = Waarde['Type']
                Date = str(Waarde['Date'])
                Time = str(Waarde['Time'])
                loc = Time.rfind(':')
                Time = Time[:loc]
                Value = Waarde['Value']
                IsDelivered = Waarde['IsDelivered']
                if ActionID == 5:
                    list_pir.append({'HistoryID': HistoryID, 'ActionID': ActionID, 'DeviceID': DeviceID,
                                    'Type': Type, 'Date': Date, 'Time': Time, 'Value': Value, 'IsDelivered': IsDelivered})
            return jsonify(list_pir)
        if id == 'month':
            data_Pir = DataRepository.read_history_where_Date_is_thismonth_with_deviceid(
                2)
            list_pir = []
            for Waarde in data_Pir:
                HistoryID = Waarde['HistoryID']
                DeviceID = Waarde['DeviceID']
                ActionID = Waarde['ActionID']
                Type = Waarde['Type']
                Date = str(Waarde['Date'])
                Time = str(Waarde['Time'])
                loc = Time.rfind(':')
                Time = Time[:loc]
                Value = Waarde['Value']
                IsDelivered = Waarde['IsDelivered']
                if ActionID == 5:
                    list_pir.append({'HistoryID': HistoryID, 'ActionID': ActionID, 'DeviceID': DeviceID,
                                    'Type': Type, 'Date': Date, 'Time': Time, 'Value': Value, 'IsDelivered': IsDelivered})
            return jsonify(list_pir)

# @app.route(endpoint + '/dataLoad', method = ['GET'])
# def get_data_Load():
#     if request.method == 'GET':
#         data_load = DataRepository.read_history_by_deviceID(3, 3)
#         list_load = []
#         for Waarde in data_load:
#             HistoryID = Waarde['HistoryID']
#             DeviceID = Waarde['DeviceID']
#             ActionID = Waarde['ActionID']
#             Type = Waarde['Type']
#             Date = str(Waarde['Date'])
#             Time = str(Waarde['Time'])
#             loc = Time.rfind(':')
#             Time = Time[:loc]
#             Value = Waarde['Value']
#             if ActionID == 3:
#                 list_load.append({'HistoryID': HistoryID, 'ActionID': ActionID, 'DeviceID': DeviceID,
#                                     'Type': Type, 'Date': Date, 'Time': Time, 'Value': Value})
#         return jsonify(list_load)


# @app.route(endpoint + '/delete' ,methods=['DELETE'] )
# def DeletePackage():
#     if request.method == 'DELETE':
#         DataRepository.delete_packages(1)


print("**** Program started ****")

# API ENDPOINTS


@app.route('/')
def hallo():
    return "Server is running, er zijn momenteel geen API endpoints beschikbaar."

# @app.route('/history/<id>', methods=['GET'])
# def accelero(id):
#     if request.method == 'GET':
#         return DataRepository.read_history_by_deviceID(id), 200

# SOCKET IO


@socketio.on('connect')
def initial_connection():
    global message
    print('A new client connect')
    socketio.emit('B2F_messageLCD', {'message': message}, broadcast=True)


if __name__ == '__main__':
    socketio.run(app, debug=False, host='0.0.0.0')
    # socketio.run(app, host='0.0.0.0', debug=False)

# if __name__ == '__main__':
#     app.run(debug=True)


# def data_pir():
#     while True:
#         data_pir = DataRepository.read_history_by_deviceID(
#             2)
#         list = []
#         for Waarde in data_pir:
#             HistoryID = Waarde['HistoryID']
#             DeviceID = Waarde['DeviceID']
#             ActionID = Waarde['ActionID']
#             Type = Waarde['Type']
#             Date = str(Waarde['Date'])
#             Time = str(Waarde['Time'])
#             Value = Waarde['Value']
#             IsDelivered = Waarde['IsDelivered']
#             list.append({'HistoryID': HistoryID, 'ActionID': ActionID, 'DeviceID': DeviceID,
#                          'Type': Type, 'Date': Date, 'Time': Time, 'Value': Value, 'IsDelivered': IsDelivered})
#         socketio.emit('B2F_dataPirForWarning', list, broadcast=True)
#         time.sleep(3)


# threading.Timer(3, data_pir).start()

# def data_accelero():
#     while True:
#         data_accelero = DataRepository.read_history_by_deviceID(1)
#         # print(data_accelero)
#         list = []
#         for Waarde in data_accelero:
#             HistoryID = Waarde['HistoryID']
#             DeviceID = Waarde['DeviceID']
#             ActionID = Waarde['ActionID']
#             Type = Waarde['Type']
#             Date = str(Waarde['Date'])
#             Time = str(Waarde['Time'])
#             Value = Waarde['Value']
#             IsDelivered = Waarde['IsDelivered']
#             list.append({'HistoryID': HistoryID, 'ActionID': ActionID, 'DeviceID': DeviceID,
#                          'Type': Type, 'Date': Date, 'Time': Time, 'Value': Value, 'IsDelivered': IsDelivered})
#         socketio.emit('B2F_dataAcceleroForWarning', list, broadcast=True)
#         time.sleep(3)

# threading.Timer(3, data_accelero).start()
