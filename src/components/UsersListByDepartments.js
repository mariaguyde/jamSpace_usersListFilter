import axios from 'axios';
import {useEffect, useState} from 'react';
import FlatList from 'flatlist-react';

const UsersListByDepartments = () => {

    const arrayDepartmentNumbers = [];
    const [state, setState] = useState({
        listUsersToDisplay:[],
    })
    const [listUser, setListUser] = useState({
        listUsers:[],
    })
    const [departmentNames, setDepartmentNames] = useState({
        listDepartmentsNames:[],
    });
    const [select, setSelect] = useState("");

    const getUsersListByDepartment = () => {
        let arrayUsersListByDepartment = [];
        //console.log('Value of the select input : ' + select);

        for (let user of listUser.listUsers) {
            //console.log(Object.values(user));
            if (Object.values(user)[2]) {
                for (let elementDepartment of Object.values(user)[2]) {
                   if (elementDepartment == select) {
                       //console.log("true match");
                       arrayUsersListByDepartment.push(user);
                   }
                }
            }
        }
        //console.log(arrayUsersListByDepartment);
        if (select !== "" && select !== "allUsers") {
            setState({
                listUsersToDisplay: arrayUsersListByDepartment,
            });
        } else if (select === "allUsers") {
            setState({
                listUsersToDisplay: listUser.listUsers,
            });
        }
        /*
        console.log(state.listUsersToDisplay);
        console.log(listUser.listUsers);
        /**/
    };

    useEffect(() => {
        getUsersListByDepartment();
    }, [select]);


    const setStateDepartment = async () => {
        // get departments names according to its number
        let result = await fetchDepartmentName();
        //console.log('results: ', result);
        setDepartmentNames({
            listDepartmentsNames:  result,
        });
    }

    const fetchDepartmentName = async  () => {
        const baseUrl = "https://geo.api.gouv.fr/";
        let arrayDepartmentNames = [];
        for (let item of arrayDepartmentNumbers) {
            const response = await fetch(baseUrl + `departements?code=${item}&fields=nom,code,codeRegion`);
            const json = await response.json();
            //console.log(json[0]);
            if (json[0] !== undefined) {
                // push the department's name in the array if we do have a result
                arrayDepartmentNames.push(json[0]);
            }
        }
        //console.log([...new Map(arrayDepartmentNames.map(v => [v.nom, v])).values()]);
        // Delete all departements duplicated in the array and return this new array
        return [...new Map(arrayDepartmentNames.map(v => [v.nom, v])).values()];
    }

    const fetchUsers = async () => {
        const apiUsers =  await axios.get("./data.json").catch(err=>console.log(err));
        setState({
            listUsersToDisplay : await apiUsers.data,
        });
        setListUser({
            listUsers : await apiUsers.data,
        });

        // get the list of departments's code  of each user so we can after get their names and display it
        for (let item of apiUsers.data) {
            //console.log(Object.values(item)[2]);
            if (Object.values(item)[2]) {
                for (let elementDepartment of Object.values(item)[2]) {
                    //console.log(elementDepartment);
                    arrayDepartmentNumbers.push(elementDepartment);
                }
            }
        }
    }

    useEffect(() => {
        fetchUsers().then(r =>setStateDepartment());
    }, []);


    return (
        <main>
            {/*filters*/}
            <div className="filtres_container">
                <label htmlFor="filter">Filtrez la liste des utilisateurs selon les départements où vous souhaitez rencontrer des musiciens</label>
                <select id="filter" name="list" value={select} onChange={(e) => (setSelect(e.target.value))}>
                    <option value="" disabled>Choissisez un département</option>
                    <option value="allUsers">Affichez la liste complète des utilisateurs</option>
                    <FlatList keyExtractor={(item) => item.code} list={departmentNames.listDepartmentsNames} renderItem={item=><option value={item.code}>{item.nom}</option>}/>
                </select>

            </div>

            {/*list of users*/}
            <div className="listUsersFiltered">
                <p className="subTitle">Résultats de votre recherche</p>
                <FlatList keyExtractor={(item) => item.id} list={state.listUsersToDisplay}  renderItem={item =>
                    <div className="users">
                        <p>{item.name}</p>
                    </div>
                }
                />
            </div>
        </main>
    );
};

export default UsersListByDepartments;
