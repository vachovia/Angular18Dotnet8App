ng g c vlad --flat means no folder, --skip-test don't create test file

ng g guard vlad --skip-tests => generates guard

ng g interceptor vlad --skip-tests => generates interceptor

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