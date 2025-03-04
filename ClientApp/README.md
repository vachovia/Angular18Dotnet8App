ng g c vlad --flat means no folder, --skip-tests don't create test file

ng g guard vlad --skip-tests => generates guard

ng g interceptor vlad --skip-tests => generates interceptor

ng g d vlad --skip-tests

// sync
this.token = this.route.snapshot.queryParams['token'];

// sync
const token = this.route.snapshot.paramMap.get('token');

// async
this.route.queryParamMap.subscribe({
    next: (params: Params) => {
    const token = params['token'];
    },
});

// we need https to enable facebook login
choco install mkcert
// then this in ssl folder
mkcert localhost

// For Facebook added script:
// <script async defer crossorigin="anonymous" src="https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v22.0&appId=1177824133842884"></script>
// On Register page added FB global variable which have already decalred in the script above