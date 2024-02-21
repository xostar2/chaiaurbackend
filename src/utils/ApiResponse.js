class ApiResponse{
    constructor(statusCode,date,message="success"){
        this.statusCode=statusCode
        this.data=data
        this.message=message
        this.success=statusCode<400
    }//status code learn
}

