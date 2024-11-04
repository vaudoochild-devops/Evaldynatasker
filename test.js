class Task {
    constructor(title, description, date) {
        this.id = Date.now();
        this.title = title;
        this.description = description;
        this.date = date;
        this.completed = false;
    }
    
    createCard() {
        const card = document.createElement("div");
        card.classList.add("card", "mb-3");
        card.dataset.id = this.id;

        const cardBody = document.createElement("div");
        cardBody.classList.add("card-body");

        const cardTitle = document.createElement("h3");
        cardTitle.classList.add("card-title","text-2xl", "font-bold", "uppercase");
        cardTitle.innerText = this.title;

        const cardDescription = document.createElement("p");
        cardDescription.classList.add("card-text");
        cardDescription.innerText = this.description;

        const cardDate = document.createElement("p");
        cardDate.classList.add("card-text");
        cardDate.innerText = `Date d'échéance : ${this.date}`;

        const completeBtn = document.createElement("button");
        completeBtn.classList.add("btn", this.completed ? "bg-gray-500" : "bg-green-500", "text-white", "py-2", "px-4", "rounded", "me-2");
        completeBtn.innerText = this.completed ? 'Marquer comme active' : 'Marquer comme terminée';

        const deleteBtn = document.createElement("button");
        deleteBtn.classList.add("btn", "bg-red-500", "text-white", "py-2", "px-4", "rounded");
        deleteBtn.innerText = 'Supprimer';

        completeBtn.addEventListener("click", () => {
            this.completed = !this.completed;
            saveTasks();
            displayTasks();
        });

        deleteBtn.addEventListener("click", () => {
            const index = tasks.indexOf(this);
            tasks.splice(index, 1);
            saveTasks();
            displayTasks();
        });

        cardBody.appendChild(cardTitle);
        cardBody.appendChild(cardDescription);
        cardBody.appendChild(cardDate);
        cardBody.appendChild(completeBtn);
        cardBody.appendChild(deleteBtn);

        card.appendChild(cardBody);

        return card;
    }
}

const tasks = [];

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasks() {
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) {
        const parsedTasks = JSON.parse(storedTasks);
        for (const taskData of parsedTasks) {
            const task = new Task(taskData.title, taskData.description, taskData.date);
            task.completed = taskData.completed;
            tasks.push(task);
            console.log(task);
        }
    }
    displayTasks();
}

function updateButtonState(item, state) {
    let button = item.querySelector('button');
    if (state === 'active') {
        button.classList.remove('bg-gray-500');
        button.classList.add('bg-green-500');
        button.textContent = 'Marquer comme terminé';
    } else {
        button.classList.remove('bg-custom-orange');
        button.classList.add('bg-gray-500');
        button.textContent = 'Marquer comme actif';
    }
}


function displayTasks() {
    const activeTaskList = document.getElementById("active-task-list");
    const completedTaskList = document.getElementById("completed-task-list");
    const filter = document.getElementById("task-filter");

    activeTaskList.innerHTML = "";
    completedTaskList.innerHTML = "";

    for (const task of tasks) {
        if (filter.value === "all" ||
            (filter.value === "active" && !task.completed) ||
            (filter.value === "completed" && task.completed)) {

            const card = task.createCard();

            if (task.completed) {
                completedTaskList.appendChild(card);
            } else {
                activeTaskList.appendChild(card);
            }
        }
    }

    new Sortable(activeTaskList, {
        group: 'listGroup',
        animation: 150,
        onAdd: function (evt) {
            const taskId = evt.item.dataset.id;
            const task = tasks.find(t => t.id == taskId);
            console.log('Task added to active list:', task);
            if (task) {
                task.completed = false;
                updateButtonState(evt.item, 'active');
                saveTasks();
            }
        },
        onRemove: function (evt) {
            const taskId = evt.item.dataset.id;
            const task = tasks.find(t => t.id == taskId);
            console.log('Task removed from active list:', task);
            if (task) {
                task.completed = true;
                updateButtonState(evt.item, 'completed');
                saveTasks();
            }
        }
    });

    new Sortable(completedTaskList, {
        group: 'listGroup',
        animation: 150,
        onAdd: function (evt) {
            const taskId = evt.item.dataset.id;
            const task = tasks.find(t => t.id == taskId);
            console.log('Task added to completed list:', task);
            if (task) {
                task.completed = true;
                updateButtonState(evt.item, 'completed');
                saveTasks();
            }
        },
        onRemove: function (evt) {
            const taskId = evt.item.dataset.id;
            const task = tasks.find(t => t.id == taskId);
            console.log('Task removed from completed list:', task);
            if (task) {
                task.completed = false;
                updateButtonState(evt.item, 'active');
                saveTasks();
            }
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("task-form");
    const sortByDate = document.getElementById("sort-by-date");

    loadTasks();

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const title = document.getElementById("task-title").value;
        const description = document.getElementById("task-description").value;
        const date = document.getElementById("task-date").value;

        const task = new Task(title, description, date);
        tasks.push(task);
        saveTasks();
        displayTasks();
        form.reset();
    });

    document.getElementById("task-filter").addEventListener("change", displayTasks);

    sortByDate.addEventListener("click", () => {
        tasks.sort((a, b) => new Date(a.date) - new Date(b.date));
        displayTasks();
    });
});
