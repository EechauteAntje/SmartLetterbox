import time
from RPi import GPIO

RS = 21
E = 20
D = [16,12,24,26,19,13,22,27]


class LCD:
    def __init__(self, RS_pin=RS, E_pin=E, D_pinnen=D):
        self.RS_pin = RS_pin
        self.E_pin = E_pin
        self.D_pinnen = D_pinnen
        GPIO.setwarnings(False)
        GPIO.setmode(GPIO.BCM)
        GPIO.setup(self.RS_pin, GPIO.OUT)
        GPIO.setup(self.E_pin, GPIO.OUT)
        for i in self.D_pinnen:
            GPIO.setup(i, GPIO.OUT)

    def send_instruction(self, value):
        GPIO.output(self.RS_pin, GPIO.LOW)

        GPIO.output(self.E_pin, GPIO.HIGH)
        self.set_data_bits(value)
        GPIO.output(self.E_pin, GPIO.LOW)

        time.sleep(0.01)

    def send_character(self, value):
        GPIO.output(self.RS_pin, GPIO.HIGH)

        GPIO.output(self.E_pin, GPIO.HIGH)
        self.set_data_bits(value)
        GPIO.output(self.E_pin, GPIO.LOW)

        time.sleep(0.01)

    def set_data_bits(self, value):
        mask = 0x01
        for i in range(0, 8):
            GPIO.output(self.D_pinnen[i], value & (mask << i))

    def init_LCD(self):
        self.send_instruction(0x38)  # function_set_byte
        self.send_instruction(0x0C)  # display_on_byte
        self.send_instruction(0x01)  # clear_display_byte

    def write_message(self, text):
        for char in text[0:16]:
            self.send_character(ord(char))
            # print(char)
        # print('lijn 2')
        self.send_instruction((0x80 | 0x40))  # voor de tweede lijn
        for char in text[16:]:
            self.send_character(ord(char))
            # print(char)
        # for char in text[0:32]:
        #     self.send_character(ord(char))

    def set_cursor(self, row, col):
        byte = row << 6 | col
        self.send_instruction(byte | 128)
