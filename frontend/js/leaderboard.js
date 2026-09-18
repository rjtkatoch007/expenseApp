const token =
    localStorage.getItem("token");

const leaderboardBody =
    document.getElementById(
        "leaderboardBody"
    );

const message =
    document.getElementById("message");


async function loadLeaderboard() {

    try {

        const response = await fetch(
            "http://localhost:3000/premium/showleaderboard",
            {
                method: "GET",

                headers: {
                    "Authorization":
                        `Bearer ${token}`
                }
            }
        );


        const users =
            await response.json();


        if (!response.ok) {

            message.innerHTML = `
                <div class="alert alert-danger">
                    ${users.message}
                </div>
            `;

            return;
        }


        leaderboardBody.innerHTML = "";


        users.forEach(
            (user, index) => {

                const row =
                    document.createElement("tr");


                row.innerHTML = `
                    <td>${index + 1}</td>

                    <td>
                        ${user.name}
                    </td>

                    <td>
                        ₹${user.totalexpenses}
                    </td>
                `;


                leaderboardBody.appendChild(row);
            }
        );


    } catch (error) {

        console.error(error);

        message.innerHTML = `
            <div class="alert alert-danger">
                Unable to load leaderboard
            </div>
        `;
    }
}


loadLeaderboard();