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

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { APIService } from "../../utils/apiService";
import { AppConfig } from "../../config/config";
import { State } from "../../types/types";

const initialState: UserState = {
  state: State.idle,
  stateMessage: null,
  errorMessage: null,
  userInfo: null,
};

interface UserState {
  state: State;
  stateMessage: string | null;
  errorMessage: string | null;
  userInfo: UserInfoInterface | null;
}

interface UserInfoInterface {
  employeeId: string;
  firstName: string;
  lastName: string;
  workEmail: string;
  employeeThumbnail: string;
  jobRole: string;
}

export const getUserInfo = createAsyncThunk("User/getUserInfo", async () => {
  return new Promise<{
    UserInfo: UserInfoInterface;
  }>((resolve, reject) => {
    APIService.getInstance()
      .get(AppConfig.serviceUrls.getUserInfo)
      .then((resp) => {
        resolve({
          UserInfo: resp.data,
        });
      })
      .catch((error: Error) => {
        reject(error);
      });
  });
});

export const UserSlice = createSlice({
  name: "getUserInfo",
  initialState,
  reducers: {
    updateStateMessage: (state, action: PayloadAction<string>) => {
      state.stateMessage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUserInfo.pending, (state, action) => {
        state.state = State.loading;
        state.stateMessage = "Checking User Info";
      })
      .addCase(getUserInfo.fulfilled, (state, action) => {
        state.userInfo = action.payload.UserInfo;
        state.state = State.success;
      })
      .addCase(getUserInfo.rejected, (state) => {
        state.state = State.failed;
      });
  },
});

export const { updateStateMessage } = UserSlice.actions;

export default UserSlice.reducer;
