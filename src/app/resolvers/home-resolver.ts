import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { from, Observable } from "rxjs";
import { CompleteSolarModel } from "src/models/CompleteSolarModel";


export class HomeResolver implements Resolve<CompleteSolarModel> {
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): CompleteSolarModel | Observable<CompleteSolarModel> | Promise<CompleteSolarModel> {

        return new Observable<CompleteSolarModel>( o => {
            const longitude = 48.846204;
            const latitude = 2.349543;
            const model = new CompleteSolarModel(longitude, latitude);
    
            o.next(model);
            o.complete();
        });
     
    }
}
