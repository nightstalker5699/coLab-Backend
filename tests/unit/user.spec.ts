import { SystemRole } from "@prisma/client";
import { signup } from "../../controllers/authController";
import { loginAsync } from "../../helpers/catchAsync";
import ValidateInput from "../../helpers/ValidateInput";
import AuthService from "../../services/auth.service";
import { IRequest } from "../../types/generalTypes";
import { Response } from "express";

jest.mock("../../helpers/ValidateInput");
jest.mock("../../services/auth.service");
jest.mock("../../helpers/catchAsync", () => ({
  catchReqAsync: (fn: any) => fn,
  catchAuthAsync: (fn: any) => fn,
  loginAsync: jest.fn(),
  authenticateAsync: jest.fn(),
}));

const mockedValidateInput = ValidateInput as jest.MockedFunction<
  typeof ValidateInput
>;
const mockedauthService = AuthService as jest.Mocked<typeof AuthService>;

const mockedLoginAsync = loginAsync as jest.MockedFunction<typeof loginAsync>;

describe("testing the jest app", () => {
  const mockReq = {
    body: {
      username: "testingUser",
      email: "me@example.com",
      password: "test1234",
    },
  };

  const mockRes: Partial<Response> & {
    status: jest.Mock<any, any>;
    json: jest.Mock<any, any>;
  } = {
    status: jest.fn(function (this: any) {
      return this;
    }),
    json: jest.fn(function (this: any) {
      return this;
    }),
  };
  const mockNext = jest.fn();

  it("signup test", async () => {
    const signupData = {
      username: "testingUser",
      email: "me@example.com",
      password: "test1234",
    };
    const newUser = {
      id: "200",
      username: "testingUser",
      email: "me@example.com",
      password: "test1234",
      googleId: null,
      githubId: null,
      createdAt: new Date(),
      updatedPasswordAt: new Date(),
      photo: "mockPhotoUrl",
      isdeleted: false,
      role: SystemRole.SYSTEMUSER,
      // Add any other required IUser properties with mock values
    };
    const response = {
      id: "200",
      username: "testingUser",
      email: "me@example.com",
      password: null,
      googleId: null,
      githubId: null,
      createdAt: new Date(),
      updatedPasswordAt: new Date(),
      photo: "mockPhotoUrl",
      isdeleted: false,
      role: SystemRole.SYSTEMUSER,
    };

    mockedValidateInput.mockReturnValue(signupData);

    mockedauthService.signup.mockResolvedValue(newUser);

    mockedLoginAsync.mockResolvedValue(undefined);
    await signup(mockReq as IRequest, mockRes as unknown as Response, mockNext);

    // Assert
    expect(mockedValidateInput).toHaveBeenCalledWith(
      mockReq.body,
      expect.anything()
    );
    expect(mockedauthService.signup).toHaveBeenCalledWith(signupData);
    expect(mockedLoginAsync).toHaveBeenCalledWith(mockReq as IRequest, newUser);
    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith({
      status: "success",
      data: {
        user: response,
      },
    });
    expect(mockNext).not.toHaveBeenCalled();
  });
});
