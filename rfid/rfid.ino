#include <SoftwareSerial.h>
#include <WiFlyHQ.h>

int  val = 0; 
char code[10]; 
int bytesread = 0; 
const char mySSID[] = "Pivotal$Guest"; //use $ to represent spaces in your ssid or passphrase
const char myPassword[] = "go2pivotal";
#define rxPin 8
#define txPin 9
WiFly wifly;
//boolean fridge = false; //false = closed
void setup()
{
  //pinMode(6, INPUT);
  pinMode(12,OUTPUT);       // Set digital pin 2 as OUTPUT to connect it to the RFID /ENABLE pin 
  digitalWrite(12, LOW);    // Activate the RFID reader 
  Serial.begin(9600);
  wifly.begin(&Serial, NULL);

  if (!wifly.isAssociated()) { //check to see if we are already associated with the network before connecting
    if (wifly.join(mySSID, myPassword, true)) { //using the true flag at the end of wifly.join indicates that we are using WPA 
      wifly.save();
    } 

  } 

  wifly.setIpProtocol(WIFLY_PROTOCOL_TCP);
  wifly.open("66.228.47.78",1337);
  wifly.print("connected");
}


void loop()
{ 
  SoftwareSerial RFID = SoftwareSerial(rxPin,txPin); 
  RFID.begin(2400);


  if((val = RFID.read()) == 10)
  {   // check for header 
    bytesread = 0; 
    while(bytesread<10)
    {  // read 10 digit code 
      val = RFID.read(); 
      if((val == 10)||(val == 13))
      {  // if header or stop bytes before the 10 digit reading 
        break;                       // stop reading 
      } 
      code[bytesread] = val;         // add the digit           
      bytesread++;                   // ready to read next digit  
    }

    if(bytesread == 10)
    {
      wifly.print(code);

    }
    bytesread = 0; 
    delay(500);                       // wait for a second
  } 
//  int pirVal = digitalRead(6);

 // if(pirVal == LOW){ //was motion detected
   // wifly.println("motion!");
   // delay(2000);
 // }
} 


