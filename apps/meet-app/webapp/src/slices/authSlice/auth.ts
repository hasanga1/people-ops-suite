// Copyright (c) 2025 WSO2 LLC. (https://www.wso2.com).
//
// WSO2 LLC. licenses this file to you under the Apache License,
// Version 2.0 (the "License"); you may not use this file except
// in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License. 

import { State } from "@/types/types";
import { RootState } from "@slices/store";
import { AppConfig } from "@config/config";
import { APIService } from "@utils/apiService";
import { SnackMessage } from "@config/constant"
import { AuthState, AuthData, Role } from "@utils/types";
import { enqueueSnackbarMessage } from "@slices/commonSlice/common";
import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";

const initialState: AuthState = {
  status: State.idle,
  mode: "active",
  statusMessage: null,
  isAuthenticated: false,
  userInfo: null,
  decodedIdToken: null,
  roles: [],
};

export const loadPrivileges = createAsyncThunk("auth/loadPrivileges", async (_, { dispatch, rejectWithValue }) => {
  return new Promise<{
    roles: Role[]
  }>((resolve, reject) => {
    APIService.getInstance()
      .get(AppConfig.serviceUrls.userInfo)
      .then((resp) => {
        const userPrivileges: number[] = resp.data.privileges;
        const roles: Role[] = [];
        if (userPrivileges.includes(762)) {
          roles.push(Role.SALES_ADMIN);
        }
        if (userPrivileges.includes(987)) {
          roles.push(Role.SALES_TEAM);
        }
        if (roles.length === 0) {
          dispatch(
            enqueueSnackbarMessage({
              message: "Insufficient privileges",
              type: "error",
            })
          );
          rejectWithValue("No roles found");
        }
        resolve({ roles });
      })
      .catch((error) => {
        const errorMessage = SnackMessage.error.fetchPrivileges;
        dispatch(
          enqueueSnackbarMessage({
            message: errorMessage,
            type: "error",
          })
        );
        reject(error);
      });
  });
});

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUserAuthData: (state, action: PayloadAction<AuthData>) => {
      state.userInfo = action.payload.userInfo;
      state.decodedIdToken = action.payload.decodedIdToken;
      state.status = State.success;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadPrivileges.pending, (state) => {
        state.status = State.loading;
      })
      .addCase(loadPrivileges.fulfilled, (state, action) => {
        state.status = State.success;
        state.roles = action.payload.roles
      })
      .addCase(loadPrivileges.rejected, (state, action) => {
        state.status = State.failed;
      });
  },
});



export const { setUserAuthData } = authSlice.actions;
export const selectUserInfo = (state: RootState) => state.auth.userInfo;
export const selectRoles = (state: RootState) => state.auth.roles;
export default authSlice.reducer;
