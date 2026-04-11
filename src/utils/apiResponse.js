export function successResponse(data = {}, message = "Success", status = 200) {
    return Response.json(
        {
            success: true,
            message,
            data,
        },
        { status }
    );
}

export function errorResponse(message = "Something went wrong", status = 500, error = null) {
    return Response.json(
        {
            success: false,
            message,
            error,
        },
        { status }
    );
}