
// SERVER VARIABLES

const env = {
    "ROOT":"http://127.0.0.1:5000/",
    "GREET":"greet",
    "CHECK":"check",
    "SIGNUP":"signup",
    "SIGNIN":"signin",
    "SEARCH_HOSPITAL":"search_hospital",
    "HOSPITAL_DEPARTMENT":"hospital_department",
    "HOSPITAL_DEPARTMENT_DOCTOR":"hospital_department_doctor",
    "SLOT":"slot",
    "BOOK_APPOINTMENT":"book_appointment",
    "NEARBY_HOSPITAL":"nearby_hospital",
    "OTHER_QUERIES":"other_queries"
};

// UTILITY FUNCTIONS
function isValidJSON(str) {
    try {
        JSON.parse(str); // Try parsing
        return true; // Valid JSON
    } catch (e) {
        return false; // Invalid JSON
    }
}

function getCurrentDate() {
    const today = new Date();

    // Get year, month, and day
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(today.getDate()).padStart(2, '0');

    // Format as YYYY-MM-DD
    return `${year}-${month}-${day}`;
}

// RESTART CHAT FROM START
function restart_chat(botui) {
    botui.message.add({
        content: "What else, Sir?"
    }).then(() => {
        return botui.action.button({
            action: [
                { text: 'Recommend Hospital', value: 'nearby_hospital' },
                { text: 'Book an Appointment', value: 'appointment' },
                { text: 'Other Queries', value: 'queries' }
            ]
        });
    }).then(res => {
        if (res.value === 'nearby_hospital') {
            nearby_hospital(res);
        }
        else if (res.value === 'appointment') {
            book_slot(res);
        }
        else if (res.value === 'queries') {

        }
    });
}


// INPUT FUNCTIONS WITH VALIDATION.
function getPhoneNumber(botui) {
    return botui.action.text({
        action: {
            placeholder: "Type your phone number here."
        }
    }).then(res => {
        const phoneNumber = res.value;

        // Example validation: Check if it's a 10-digit number
        if (!/^\d{10}$/.test(phoneNumber)) {
            botui.message.add({ content: "Invalid phone number. Please enter a 10-digit number." });
            return getPhoneNumber(botui);
        }
        return phoneNumber;
    });
}

function getName(botui) {
    return botui.action.text({
        action: {
            placeholder: "Type your name here."
        }
    }).then(res => {
        const name = res.value;


        if (!/^[a-zA-Z ]{3,}$/.test(name)) {
            botui.message.add({ content: "Invalid Name. Please enter 3 character at least." });
            return getName(botui);
        }
        return name;
    });
}

function getAge(botui) {
    return botui.action.text({
        action: {
            placeholder: "Type your age here."
        }
    }).then(res => {
        const age = res.value;

        if (!/^([0-9]|[1-9][0-9]|1[0-4][0-9]|150)$/.test(age)) {
            botui.message.add({ content: "Invalid Age. Maximum 150." });
            return getAge(botui);
        }
        return age;
    });
}

function getGender(botui) {
    botui.message.add({ content: "Choose your Gender." });
    return botui.action.button({
        action: [
            { text: 'Male', value: 'male' },
            { text: 'Female', value: 'female' },
            { text: 'Custom', value: 'custom' }
        ]
    }).then(res => {
        const gender = res.value;
        console.log(gender);
        console.log(gender !== 'male');
        console.log(gender !== 'female');
        console.log(gender !== 'custom');
        if(gender !== 'male' && gender !== 'female' && gender !== 'custom'){
            botui.message.add({ content: "Invalid Gender" });
            return getGender(botui);
        }
        return gender;
    });
}

function getSearchKeyword(botui) {
    return botui.action.text({
        action: {
            placeholder: "Type name or location of the hospital."
        }
    }).then(res => {
        const keyword = res.value;


        if (!/^[a-zA-Z ]{3,}$/.test(keyword)) {
            botui.message.add({ content: "Invalid Keyword. Please enter 3 character at least." });
            return getSearchKeyword(botui);
        }
        return keyword;
    });
}

function selectHospital(botui) {}



// BUTTON FUNCTIONS
function nearby_hospital(res) {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(function(position) {
            // Success callback

            // const latitude = position.coords.latitude;
            // const longitude = position.coords.longitude;
            const latitude = 8.517061966475845
            const longitude= 76.94051012403658

            console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
            fetch(`${env.ROOT}${env.NEARBY_HOSPITAL}?lat=${latitude}&lon=${longitude}&radius=${1500}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            }).then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    return response.json();
                    // console.log(data);
                    // return Promise.reject(`${data.message}`);
                }
            })
                .then(data => {
                    console.log(data)
                    if(data.status === "fail"){
                        botui.message.add({ content: data.message });
                    }if(data.status === "success"){
                        hospitals = []
                        data.data.forEach(item => {
                            // console.log(n);
                            hospitals.push({text: `(${item.distance.toFixed(1)} m) ${item.hospital.name}`, value:item.hospital},)
                        })

                        console.log(hospitals)

                        return botui.action.button({
                            action:hospitals
                        }).then();
                    }
                    // hospitals = data.data;
                    // console.log(hospitals);
                    // // botui.message.add({ content: data.response });
                }).then(res=>{
                botui.message.add({
                    type:'html',
                    content: `<div class="message"> 
                                          <div class="heading1">${res.value.name}</div>
                                          <div class="heading2">${res.value.place}</div>
                                          <div class="link"><a href="https://www.google.com/maps?q=${res.value.lat},${res.value.lon}" target="_blank">View on Google Maps</a>
                                          </div>
                                   </div>`

                });

                restart_chat(botui);

            }).catch(error => {
                // botui.message.add({ content: error });
            });


        }, function(error) {
            // Error callback (if there's an issue getting location)
            console.error('Error getting location:', error);
        });
    }
}



function book_slot() {

    const userdata_string = localStorage.getItem('user_data');

    if((!isValidJSON(userdata_string)) || userdata_string == null){
        botui.message.add({
            content: "Please login by providing your phone number:"
        }).then(()=>{
            getPhoneNumber(botui).then((res)=>{
                const ph_no = res;
                fetch(`${env.ROOT}${env.SIGNIN}?ph_no=${res}`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                }).then(response => {
                    if (response.ok) {
                        return response.json();
                    } else {
                        return response.json();
                    }
                }).then(async data => {
                    console.log(data)
                    if (data.status === "fail") {
                        botui.message.add({content: `${data.message} ,Please provide name, age, gender and phone number`});
                        const name = await getName(botui);
                        const age =  await getAge(botui);
                        const gender = await getGender(botui);


                        fetch(`${env.ROOT}${env.SIGNUP}`, {
                            method: 'POST',
                            body: JSON.stringify({
                                name: name,
                                age: age,
                                gender: gender,
                                ph_no: ph_no,
                            }),
                            headers: {'Content-Type': 'application/json'},
                        }).then(response => {
                            if (response.ok) {
                                return response.json();
                            }
                        }).then(data => {
                            console.log(data);
                            localStorage.setItem('user_data', JSON.stringify(data.data));
                            let udata = localStorage.getItem('user_data');
                            console.log(JSON.parse(udata))
                            book_slot();
                        })

                    }

                    if (data.status === "success") {
                        console.log(data)
                        localStorage.setItem('user_data', JSON.stringify(data.data));
                        let udata = localStorage.getItem('user_data');
                        console.log(JSON.parse(udata))
                        book_slot();
                    }
                })
            });
            }
        )

    }else{
        const userdata = JSON.parse(userdata_string)
        botui.message.add({ content: "Enter the search keyword for finding the hospital." });
        getSearchKeyword(botui).then((res)=>{
            fetch(`${env.ROOT}${env.SEARCH_HOSPITAL}?hospital=${res}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            }).then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    return response.json();
                }
            }).then(data => {
                if(data.status === "fail"){
                    botui.message.add({ content: data.message });
                }
                if(data.status === "success"){
                    botui.message.add({ content: data.message });
                    hospitals = []
                    data.data.forEach(item => {
                        hospitals.push({text: `${item.name}`, value:item},)
                    })
                    return botui.action.button({
                        action:hospitals
                    }).then();
                }
            }).then(async res => {
                const hospital = res.value;
                botui.message.add({
                    type: 'html',
                    content: `<div class="message"> 
                                    <div class="heading1">${hospital.name}</div>
                                    <div class="heading2">${hospital.place}</div>
                                    <div class="link"><a href="https://www.google.com/maps?q=${hospital.lat},${hospital.lon}" target="_blank">View on Google Maps</a></div>
                              </div>`
                });

                botui.message.add({
                    content: `Select the Department.`
                }).then(() => {

                    fetch(`${env.ROOT}${env.HOSPITAL_DEPARTMENT}?hospital=${hospital.id}`, {
                        method: 'GET',
                        headers: {'Content-Type': 'application/json'},
                    }).then(response => {
                        if (response.ok) {
                            return response.json();
                        } else {
                            return response.json();
                        }
                    }).then(data => {

                        if (data.status === "fail") {
                            botui.message.add({content: data.message});
                        }
                        if (data.status === "success") {
                            botui.message.add({content: data.message});
                            departments = []

                            data.data.forEach(item => {
                                departments.push({text: `${item.name}`, value: item},)
                            })

                            return botui.action.button({
                                action: departments
                            }).then((res) => {
                                const department = res.value;
                                botui.message.add({
                                    content: `Select the Doctor.`
                                })

                                fetch(`${env.ROOT}${env.HOSPITAL_DEPARTMENT_DOCTOR}?hospital=${department.hospital}&department=${department.id}`, {
                                    method: 'GET',
                                    headers: {'Content-Type': 'application/json'},
                                }).then(response => {
                                    if (response.ok) {
                                        return response.json();
                                    } else {
                                        return response.json();
                                    }
                                }).then(data => {

                                    if (data.status === "fail") {
                                        botui.message.add({content: data.message});
                                    }
                                    if (data.status === "success") {
                                        botui.message.add({content: data.message});
                                        doctors = []

                                        data.data.forEach(item => {
                                            doctors.push({text: `Dr. ${item.name}`, value: item},)
                                        })



                                        return botui.action.button({
                                            action: doctors
                                        }).then((res) => {
                                            const doctor = res.value;
                                            botui.message.add({
                                                content: `Select the Slot.`
                                            })

                                            fetch(`${env.ROOT}${env.SLOT}?slot_date=${getCurrentDate()}&hospital_department_doctor=${doctor.hospital_department_doctor_rel_id}`, {
                                                method: 'GET',
                                                headers: {'Content-Type': 'application/json'},
                                            }).then(response => {
                                                if (response.ok) {
                                                    return response.json();
                                                } else {
                                                    return response.json();
                                                }
                                            }).then(data => {
                                                console.log(data)
                                                if (data.status === "fail") {
                                                    botui.message.add({content: data.message});
                                                }
                                                if (data.status === "success") {
                                                    botui.message.add({content: data.message});
                                                    slots = []
                                                    console.log(data.data)
                                                    data.data.forEach(item => {
                                                        if(item.count<15){
                                                            slots.push({text: `(${item.count}) ${item.start_time}`, value: item},)
                                                        }
                                                    })

                                                    console.log(departments)
                                                    if(slots.length > 0){
                                                        return botui.action.button({
                                                            action: slots
                                                        }).then((res) => {
                                                            console.log('doctor befor post')
                                                            console.log(doctor);
                                                            const slot = res.value;
                                                            fetch(`${env.ROOT}${env.BOOK_APPOINTMENT}`, {
                                                                method: 'POST',
                                                                body: JSON.stringify({
                                                                    user: userdata.id,
                                                                    slot: slot.id,
                                                                    slot_date: getCurrentDate(),
                                                                    hospital_department_doctor: doctor.hospital_department_doctor_rel_id
                                                                 }),
                                                                headers: {'Content-Type': 'application/json'},
                                                            }).then(response => {
                                                                if (response.ok) {
                                                                    return response.json();
                                                                } else {
                                                                    return response.json();
                                                                }
                                                            }).then(data => {
                                                                console.log(data)
                                                                if (data.status === "fail") {
                                                                    botui.message.add({content: data.message});
                                                                }
                                                                if (data.status === "success") {
                                                                    const booking = data.data
                                                                    botui.message.add({content: data.message});
                                                                    botui.message.add({
                                                                        type: 'html',
                                                                        content: `
                                                                                    <div class="message">
                                                                                              <div class="heading1">Slot Booked</div>
                                                                                              <div class="heading2">
                                                                                              Booking id &nbsp; <span style="font-weight: bold"> ${booking.id} </span> <br> 
                                                                                              User &nbsp; <span style="font-weight: bold"> ${userdata.name} </span> <br>
                                                                                              Hospital &nbsp; <span style="font-weight: bold"> ${hospital.name} </span> <br>
                                                                                              Doctor &nbsp; <span style="font-weight: bold"> ${doctor.name} </span> <br>
                                                                                              Date &nbsp; <span style="font-weight: bold"> ${getCurrentDate()} </span> <br>
                                                                                              Time &nbsp; <span style="font-weight: bold"> ${slot.start_time} </span> <br>
                                                                                              
                                                                                             </div>
                                                                                             </div>
                                                                                       </div>`
                                                                    });

                                                                }
                                                            })
                                                        });

                                                    }else {
                                                        return botui.message.add({content: 'Sorry all slots are filled.'});
                                                    }
                                                }
                                            })
                                        });
                                    }
                                })
                            });
                        }
                    })
                }).then(()=>{
                    // restart_chat(botui);
                });
            }).catch(error => {
                // botui.message.add({ content: error });
            });
        })
    }
}


const botui = new BotUI('chat-app');

botui.message.add({
    content: "Hello! Welcome to Healthcare Support Center. How can I assist you today?"
}).then(() => {
    return botui.action.button({
        action: [
            { text: 'Recommend hospital', value: 'nearby_hospital' },
            { text: 'Book an Appointment', value: 'appointment' },
            { text: 'Other Queries', value: 'queries' }
        ]
    });
}).then(res => {
    if (res.value === 'nearby_hospital') {
        nearby_hospital(res);
}
    else if (res.value === 'appointment') {
        book_slot(res);
    }
    else if (res.value === 'queries') {

    }
});



