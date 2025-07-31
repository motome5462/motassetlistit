This is for saving asset of MOT and Create Po And Pr
server is port 4000
Mongodb is port 27017
C:\Program Files\MongoDB\Server\8.0\bin\mongod.cfg
net:
  bindIp: 0.0.0.0
  port: 27017

Win + R  :control firewall.cpl
    Advanced Settings
    Inbound Rules New Rule
    Choose Port
    Choose TCP 
        Specific local: 27017
    Allow the connection
    only Private (unless you want it open for public networks too)
    Name it

CMD:
net stop MongoDB
net start MongoDB

go change in .env