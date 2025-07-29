# to configure who is going to be the broker and where the data is going to be stored 
broker_url="redis://localhost:6379/0" # message broker stores the work and then assigns it to workers || redis runs on port number : 6379
result_backend ="redis://localhost:6379/1" # it will store the results of the worker || /1 represents a segment of database, 0 represents another segment of the database
Timezone="Asia/kolkata"
broker_connection_retry_on_startup = True # if the broker is not available it will retry to connect to the broker