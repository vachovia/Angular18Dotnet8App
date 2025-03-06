export class RegisterWithExternalClass {
    firstName: string;
    lastName: string;
    userId: string;
    accessorToken: string;
    provider: string;

    constructor(firstName: string, lastName: string, userId: string, accessorToken: string, provider: string) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.userId = userId;
        this.accessorToken = accessorToken;
        this.provider = provider;
    }
}