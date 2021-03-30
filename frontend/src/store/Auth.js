import axios from 'axios'
import router from '../router';

const state = {
    token: null,
    user: null,
};

const mutations = {
    SET_TOKEN(state, token){
        state.token = token
    },

    SET_USER(state, data){
        state.user = data;
    },
    register_request(state){
        state.status = 'loading'
    },
    register_success(state){
        state.status = 'success'
    },
    password_request(state){
        state.status = 'loading'
    },
    password_success(state){
        state.status = 'success'
    },
    logout(state){
        state.status = ''
        state.token = ''
        state.user = ''
    }
    };

const getters = {
    isLoggedIn(state){
        return state.token && state.user;
    },

    isAdmin(state){
        if(state.user.user.role == 'admin'){
            return true;
        }else return false;
    },
    
    isManager(state){
        if(state.user.user.role == 'manager'){
            return true;
        }else return false;
    },

    isEmployee(state){
        if(state.user.user.role == 'employee'){
            return true;
        }else return false;
    },

    user(state){
        return state.user;
    },
};

const actions = {
    async login({ dispatch }, user){
        let res = await axios.post(process.env.VUE_APP_MAIN_PATH+'/api/users/login', user)
        
        return dispatch('attempt', res.data.token)
    },

    async attempt({ commit, state }, token){
        if(token){
            commit('SET_TOKEN', token)
        }
        if(!state.token){
            return 
        }

        commit('SET_TOKEN', token)

        try{
            let res = await axios.get(process.env.VUE_APP_MAIN_PATH+'/api/users/me')
            commit('SET_USER', res.data)
        }catch(e){
            commit('SET_TOKEN', null)
            commit('SET_USER', null)
        }
    },

    async register({
        commit
    }, userData){
        commit('register_request');
        let res = await axios.post(process.env.VUE_APP_MAIN_PATH+'/api/users/register', userData);
        if(res.data.success !== undefined){
            commit('register_success');
        }
        return res;
    },

    async changePin({
        commit
    }, passwordData){
        commit('password_request');
        let res = await axios.post(process.env.VUE_APP_MAIN_PATH+'/api/users/changepassword', passwordData);
        if(res.data.success !== undefined){
            commit('password_success');            
        }
        return res;
        
    },

    async logout({commit}, message){
        commit('SET_TOKEN', null);
        commit('SET_USER', null);
        router.push({
            path: "login",
            query: { msg: message}
        }).catch(err => {
            // Ignore the vuex err regarding  navigating to the page they are already on.
            if (
              err.name !== 'NavigationDuplicated' &&
              !err.message.includes('Avoided redundant navigation to current location')
            ) {
              // But print any other errors to the console
              console.log(err);
            }
          });
        return
    }
}

export default{
    state,
    actions,
    mutations,
    getters
};