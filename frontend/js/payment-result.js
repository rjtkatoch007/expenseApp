const params = new URLSearchParams(
    window.location.search
);

const orderId = params.get("order_id");

const token =
    localStorage.getItem("token");


const successAlert =
    document.getElementById("successAlert");

const failedAlert =
    document.getElementById("failedAlert");

const pendingAlert =
    document.getElementById("pendingAlert");


async function checkPaymentStatus() {

    if (!orderId) {

        failedAlert.classList.remove("d-none");

        return;
    }


    if (!token) {

        failedAlert.classList.remove("d-none");

        return;
    }


    try {

        const response = await fetch(
            `http://localhost:3000/payment/status/${orderId}`,
            {
                method: "GET",

                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );


        const data = await response.json();


        if (data.status === "PAID") {

            successAlert.classList.remove("d-none");

        }
        else if (data.status === "FAILED") {

            failedAlert.classList.remove("d-none");

        }
        else {

            pendingAlert.classList.remove("d-none");

        }

    }
    catch (error) {

        console.error(error);

        failedAlert.classList.remove("d-none");
    }
}


checkPaymentStatus();